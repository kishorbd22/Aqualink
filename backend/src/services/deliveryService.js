/**
 * Aqualink - Delivery Service
 *
 * Business logic for delivery CRUD and status management.
 */

const { models, sequelize } = require('../models');
const { Op } = require('sequelize');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Valid status transitions.
 */
const VALID_TRANSITIONS = {
  assigned: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

/**
 * Create a new delivery for an order.
 * Only the fisher who owns the listing or admin can create a delivery.
 * Order must already be accepted.
 * One delivery per order enforced.
 * @param {string} orderId - UUID of the order
 * @param {string} transporterId - UUID of the transporter user
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} The created delivery with order and transporter info
 */
const createDelivery = async (orderId, transporterId, user) => {
  if (!orderId || !transporterId) {
    throw new ValidationError('orderId and transporterId are required.');
  }

  // Fetch the order to verify it exists and is accepted
  const order = await models.Order.findByPk(orderId, {
    include: [
      {
        model: models.Listing,
        as: 'listing',
      },
    ],
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  // Only the fisher who owns the listing or admin can create a delivery
  if (order.listing.fisherId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You can only create deliveries for your own listings.');
  }

  // Order must be accepted
  if (order.status !== 'accepted') {
    throw new ValidationError(
      `Cannot create delivery. Order status is "${order.status}". Only accepted orders can be delivered.`
    );
  }

  // Check if a delivery already exists for this order
  const existingDelivery = await models.Delivery.findOne({
    where: { orderId },
  });

  if (existingDelivery) {
    throw new ValidationError('A delivery already exists for this order.');
  }

  // Verify the transporter exists and has the transporter role
  const transporter = await models.User.findByPk(transporterId);
  if (!transporter) {
    throw new NotFoundError('Transporter not found.');
  }

  if (transporter.role !== 'transporter') {
    throw new ValidationError(
      `User "${transporter.name}" has role "${transporter.role}". Only users with role "transporter" can be assigned.`
    );
  }

  // Create the delivery in a database transaction
  const delivery = await sequelize.transaction(async (t) => {
    const newDelivery = await models.Delivery.create(
      {
        orderId,
        transporterId,
        status: 'assigned',
      },
      { transaction: t }
    );

    return newDelivery;
  });

  // Return with associations
  return await models.Delivery.findByPk(delivery.id, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
      {
        model: models.User,
        as: 'transporter',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });
};

/**
 * Get deliveries based on user role.
 * Buyers see deliveries for their own orders.
 * Fishers see deliveries for orders on their listings.
 * Transporters see deliveries assigned to them.
 * Admins see all deliveries.
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Array} List of deliveries
 */
const getDeliveries = async (user) => {
  const where = {};

  if (user.role === 'buyer') {
    // Buyers see deliveries for their own orders
    const userOrders = await models.Order.findAll({
      where: { buyerId: user.id },
      attributes: ['id'],
    });
    const orderIds = userOrders.map((o) => o.id);
    if (orderIds.length === 0) {
      return [];
    }
    where.orderId = { [Op.in]: orderIds };
  } else if (user.role === 'fisher') {
    // Fishers see deliveries for orders on their listings
    const userListings = await models.Listing.findAll({
      where: { fisherId: user.id },
      attributes: ['id'],
    });
    const listingIds = userListings.map((l) => l.id);
    if (listingIds.length === 0) {
      return [];
    }
    const listingOrders = await models.Order.findAll({
      where: { listingId: { [Op.in]: listingIds } },
      attributes: ['id'],
    });
    const orderIds = listingOrders.map((o) => o.id);
    if (orderIds.length === 0) {
      return [];
    }
    where.orderId = { [Op.in]: orderIds };
  } else if (user.role === 'transporter') {
    // Transporters see deliveries assigned to them
    where.transporterId = user.id;
  }
  // Admins see all — no filter

  return await models.Delivery.findAll({
    where,
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
      {
        model: models.User,
        as: 'transporter',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get a single delivery by ID.
 * @param {string} id - Delivery UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Delivery with order and transporter info
 */
const getDeliveryById = async (id, user) => {
  const delivery = await models.Delivery.findByPk(id, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
      {
        model: models.User,
        as: 'transporter',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });

  if (!delivery) {
    throw new NotFoundError('Delivery not found.');
  }

  // Check access
  const order = delivery.order;
  const listing = order.listing;
  if (
    order.buyerId !== user.id &&
    listing.fisherId !== user.id &&
    delivery.transporterId !== user.id &&
    user.role !== 'admin'
  ) {
    throw new ForbiddenError('You do not have access to this delivery.');
  }

  return delivery;
};

/**
 * Update delivery status.
 * Only the assigned transporter or admin can update delivery status.
 * Validates status transitions and handles side effects.
 * @param {string} deliveryId - Delivery UUID
 * @param {string} newStatus - Target status
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Updated delivery
 */
const updateDeliveryStatus = async (deliveryId, newStatus, user) => {
  if (!deliveryId || !newStatus) {
    throw new ValidationError('deliveryId and status are required.');
  }

  const validStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    throw new ValidationError(
      `Status must be one of: ${validStatuses.join(', ')}.`
    );
  }

  const delivery = await models.Delivery.findByPk(deliveryId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.Listing,
            as: 'listing',
          },
        ],
      },
    ],
  });

  if (!delivery) {
    throw new NotFoundError('Delivery not found.');
  }

  // Only the assigned transporter or admin can update status
  if (delivery.transporterId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to update this delivery status.');
  }

  // Validate status transition
  const currentStatus = delivery.status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    throw new ValidationError(
      `Cannot transition delivery status from "${currentStatus}" to "${newStatus}".`
    );
  }

  // Execute the update with side effects in a database transaction
  const updatedDelivery = await sequelize.transaction(async (t) => {
    const updateData = { status: newStatus };

    // Set pickup_time when status becomes picked_up
    if (newStatus === 'picked_up') {
      updateData.pickupTime = new Date();
    }

    // Set delivery_time when status becomes delivered
    if (newStatus === 'delivered') {
      updateData.deliveryTime = new Date();
    }

    await delivery.update(updateData, { transaction: t });

    // When status becomes delivered: update order.status and transaction.settlement_status
    if (newStatus === 'delivered') {
      await delivery.order.update(
        { status: 'delivered' },
        { transaction: t }
      );

      // Find and update the transaction settlement status
      const transaction = await models.Transaction.findOne({
        where: { orderId: delivery.orderId },
        transaction: t,
      });

      if (transaction) {
        await transaction.update(
          { settlementStatus: 'completed' },
          { transaction: t }
        );
      }
    }

    return delivery;
  });

  // Return updated delivery with associations
  return await models.Delivery.findByPk(deliveryId, {
    include: [
      {
        model: models.Order,
        as: 'order',
        include: [
          {
            model: models.User,
            as: 'buyer',
            attributes: ['id', 'name', 'phone', 'role'],
          },
          {
            model: models.Listing,
            as: 'listing',
            include: [
              {
                model: models.User,
                as: 'fisher',
                attributes: ['id', 'name', 'phone', 'role'],
              },
            ],
          },
        ],
      },
      {
        model: models.User,
        as: 'transporter',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
};