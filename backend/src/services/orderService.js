/**
 * Aqualink - Order Service
 *
 * Business logic for order CRUD and status management.
 */

const { models, sequelize } = require('../models');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const notificationService = require('./notificationService');

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

  // Create the order (no listing status change — multiple pending orders allowed)
  const newOrder = await models.Order.create({
    buyerId,
    listingId,
    quantityKg,
    totalPrice,
    status: 'pending',
  });

  // Return the order with associations
  const createdOrder = await models.Order.findByPk(newOrder.id, {
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

  // Notify the listing owner (fisher) about the new order
  notificationService
  .createNotification(
      listing.fisherId,
      'New Order',
      `New order received for ${listing.species}.`,
      'order'
  )
  .catch(err => {
      console.error('NOTIFICATION ERROR');
      console.error(err);
  });

  // Include the listing's current available weight in the response
  // Weight is NOT deducted at create time — only upon acceptance.
  return {
    ...createdOrder.toJSON(),
    remainingWeight: parseFloat(listing.weight),
  };
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

  // Use transaction to update order status and listing inventory atomically
  await sequelize.transaction(async (t) => {
    // Reload listing inside the transaction to get the latest weight.
    // This prevents race conditions when multiple orders on the same
    // listing are accepted concurrently.
    const listing = await models.Listing.findByPk(order.listingId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    await order.update({ status }, { transaction: t });

    // --- Inventory Validation & Deduction Logic ---
    // Before accepting, re-verify that sufficient inventory remains.
    // The listing was loaded with row-locking inside this transaction,
    // so this reflects the true current state (not a stale snapshot).
    if (status === 'accepted') {
      const currentWeight = parseFloat(listing.weight);
      const orderedQty = parseFloat(order.quantityKg);

      if (currentWeight < orderedQty) {
        throw new ValidationError(
          `Insufficient inventory. Requested ${orderedQty} kg but only ${currentWeight} kg remaining.`
        );
      }

      const newWeight = currentWeight - orderedQty;

      if (newWeight <= 0) {
        // No weight remaining — mark listing as sold
        // All inventory has been consumed by accepted orders.
        await listing.update(
          { weight: 0, status: 'sold' },
          { transaction: t }
        );
      } else {
        // Partial fulfillment: update remaining weight and make listing
        // available again so other buyers can purchase the remaining stock.
        await listing.update(
          { weight: parseFloat(newWeight.toFixed(2)), status: 'available' },
          { transaction: t }
        );
      }
    }

    // For 'rejected': no listing changes needed because inventory was
    // never deducted at order creation. The listing remains 'available'
    // for other buyers.

    // For 'delivered': no listing changes are needed because weight was
    // already deducted at the 'accepted' stage. The listing status may
    // already be 'available' (if partial fulfillment) or 'sold' (if fully
    // consumed), and neither should change upon delivery.
  });

  // Send notifications after successful status update
  if (status === 'accepted') {
    // Notify the buyer that their order was accepted
    notificationService
      .createNotification(
        order.buyerId,
        'Order Accepted',
        `Your order for ${order.listing.species} has been accepted.`,
        'order'
      )
      .catch((err) => console.error('Failed to send order-accepted notification:', err.message));

    // Notify the fisher if the listing sold out (weight became 0 and status became sold)
    const updatedListing = await models.Listing.findByPk(order.listingId);
    if (updatedListing && parseFloat(updatedListing.weight) === 0 && updatedListing.status === 'sold') {
      notificationService
        .createNotification(
          updatedListing.fisherId,
          'Listing Sold Out',
          `Your listing '${updatedListing.species}' has sold out.`,
          'inventory'
        )
        .catch((err) => console.error('Failed to send listing-sold-out notification:', err.message));
    }
  } else if (status === 'rejected') {
    // Notify the buyer that their order was rejected
    notificationService
      .createNotification(
        order.buyerId,
        'Order Rejected',
        `Your order for ${order.listing.species} has been rejected.`,
        'order'
      )
      .catch((err) => console.error('Failed to send order-rejected notification:', err.message));
  }

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