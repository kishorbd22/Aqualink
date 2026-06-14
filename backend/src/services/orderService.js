/**
 * Aqualink - Order Service
 *
 * Business logic for order CRUD and status management.
 */

const { models, sequelize } = require('../models');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Create a new order.
 * Only buyers can create orders. Total price is auto-calculated from listing.
 * @param {Object} data - { listingId, quantityKg }
 * @param {string} buyerId - UUID of the authenticated buyer
 * @returns {Object} The created order with buyer and listing info
 */
const createOrder = async (data, buyerId) => {
  const { listingId, quantityKg } = data;

  if (!listingId || !quantityKg) {
    throw new ValidationError('listingId and quantityKg are required.');
  }

  // Fetch the listing to verify it exists and is available
  const listing = await models.Listing.findByPk(listingId);

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  if (listing.status !== 'available') {
    throw new ValidationError('Listing is not available for purchase.');
  }

  // Check that quantity does not exceed listing weight
  if (parseFloat(quantityKg) > parseFloat(listing.weight)) {
    throw new ValidationError(
      `Requested quantity (${quantityKg} kg) exceeds available weight (${listing.weight} kg).`
    );
  }

  // Calculate total price
  const totalPrice = (parseFloat(listing.pricePerKg) * parseFloat(quantityKg)).toFixed(2);

  // Use a transaction to create the order and update listing status atomically
  const order = await sequelize.transaction(async (t) => {
    // Create the order
    const newOrder = await models.Order.create(
      {
        buyerId,
        listingId,
        quantityKg,
        totalPrice,
        status: 'pending',
      },
      { transaction: t }
    );

    // Mark listing as reserved
    await listing.update({ status: 'reserved' }, { transaction: t });

    return newOrder;
  });

  // Return the order with associations
  return await models.Order.findByPk(order.id, {
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
  });
};

/**
 * Get all orders with optional filtering.
 * Buyers see their own orders. Fishers see orders on their listings. Admins see all.
 * @param {Object} filters - { status, buyerId, listingId }
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Array} List of orders
 */
const getOrders = async (filters = {}, user) => {
  const where = {};

  if (filters.status) where.status = filters.status;

  // Role-based filtering
  if (user.role === 'buyer') {
    // Buyers see only their own orders
    where.buyerId = user.id;
  } else if (user.role === 'fisher') {
    // Fishers see orders on their own listings
    const userListings = await models.Listing.findAll({
      where: { fisherId: user.id },
      attributes: ['id'],
    });
    const listingIds = userListings.map((l) => l.id);
    if (listingIds.length === 0) {
      return []; // No listings, no orders
    }
    where.listingId = { [models.Sequelize.Op.in]: listingIds };
  } else if (filters.buyerId) {
    where.buyerId = filters.buyerId;
  }

  if (filters.listingId) where.listingId = filters.listingId;

  return await models.Order.findAll({
    where,
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
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get a single order by ID.
 * @param {string} id - Order UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Order with buyer and listing info
 */
const getOrderById = async (id, user) => {
  const order = await models.Order.findByPk(id, {
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
  });

  if (!order) {
    throw new NotFoundError('Order not found.');
  }

  // Check access: buyer owns the order, fisher owns the listing, or admin
  const listing = order.listing;
  if (
    order.buyerId !== user.id &&
    listing.fisherId !== user.id &&
    user.role !== 'admin'
  ) {
    throw new ForbiddenError('You do not have access to this order.');
  }

  return order;
};

/**
 * Update the status of an order.
 * - pending -> accepted or rejected (by listing owner (fisher) or admin)
 * - accepted -> delivered (by fisher or admin)
 * @param {string} id - Order UUID
 * @param {string} status - New status
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Updated order
 */
const updateOrderStatus = async (id, status, user) => {
  const validStatuses = ['accepted', 'rejected', 'delivered'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      `Status must be one of: ${validStatuses.join(', ')}.`
    );
  }

  const order = await models.Order.findByPk(id, {
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

  // Determine if user is the listing owner (fisher) or admin
  const isFisher = order.listing.fisherId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isFisher && !isAdmin) {
    throw new ForbiddenError(
      'Only the listing owner (fisher) or an admin can update order status.'
    );
  }

  // Validate status transitions
  const currentStatus = order.status;

  // From pending: can go to accepted or rejected
  if (currentStatus === 'pending') {
    if (!['accepted', 'rejected'].includes(status)) {
      throw new ValidationError(
        `Cannot change status from "pending" to "${status}". Allowed: accepted or rejected.`
      );
    }
  }
  // From accepted: can go to delivered
  else if (currentStatus === 'accepted') {
    if (status !== 'delivered') {
      throw new ValidationError(
        `Cannot change status from "accepted" to "${status}". Allowed: delivered.`
      );
    }
  }
  // From rejected or delivered: no further changes allowed
  else {
    throw new ValidationError(
      `Cannot change status from "${currentStatus}". Order is already finalized.`
    );
  }

  // Use transaction to update order status and listing status
  await sequelize.transaction(async (t) => {
    await order.update({ status }, { transaction: t });

    // If rejected, set listing back to available
    if (status === 'rejected') {
      await order.listing.update({ status: 'available' }, { transaction: t });
    }

    // If accepted or delivered, set listing to sold
    if (status === 'accepted' || status === 'delivered') {
      await order.listing.update({ status: 'sold' }, { transaction: t });
    }
  });

  // Return updated order with associations
  return await models.Order.findByPk(id, {
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
  });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};