/**
 * Aqualink - Review Service
 *
 * Business logic for review CRUD with role-based access and validation.
 * Only buyers who own a delivered order can create one review per order.
 */

const { models } = require('../models');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const notificationService = require('./notificationService');

/**
 * Create a new review.
 * Only the buyer who owns the delivered order can create a review.
 * One review per order enforced via unique constraint.
 * @param {Object} data - { orderId, rating, comment }
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} The created review with order, buyer, and fisher info
 */
const createReview = async (data, user) => {
  const { orderId, rating, comment } = data;

  if (!orderId || rating === undefined || rating === null) {
    throw new ValidationError('orderId and rating are required.');
  }

  // Validate rating range
  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw new ValidationError('Rating must be an integer between 1 and 5.');
  }

  // Fetch the order to verify it exists and is delivered
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

  // Only the buyer who owns the order can review it
  if (order.buyerId !== user.id) {
    throw new ForbiddenError('You can only review your own orders.');
  }

  // Order must be delivered
  if (order.status !== 'delivered') {
    throw new ValidationError(
      `Cannot review order with status "${order.status}". Only delivered orders can be reviewed.`
    );
  }

  // Check if a review already exists for this order (duplicate prevention)
  const existingReview = await models.Review.findOne({
    where: { orderId },
  });

  if (existingReview) {
    throw new ValidationError('A review already exists for this order.');
  }

  // Create the review
  const newReview = await models.Review.create({
    orderId,
    buyerId: user.id,
    fisherId: order.listing.fisherId,
    rating: parsedRating,
    comment: comment || null,
  });

  // Notify the fisher about the new review
  notificationService
    .createNotification(
      order.listing.fisherId,
      'New Review',
      `You received a ${parsedRating}-star review for an order.`,
      'order'
    )
    .catch((err) => console.error('Failed to send new-review notification:', err.message));

  // Return the review with associations
  return await models.Review.findByPk(newReview.id, {
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
      {
        model: models.User,
        as: 'buyer',
        attributes: ['id', 'name', 'phone', 'role'],
      },
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });
};

/**
 * Get all reviews with optional filtering.
 * Admins see all. Public access for read.
 * @param {Object} filters - { fisherId, buyerId, rating, orderId }
 * @returns {Array} List of reviews
 */
const getReviews = async (filters = {}) => {
  const where = {};

  if (filters.fisherId) where.fisherId = filters.fisherId;
  if (filters.buyerId) where.buyerId = filters.buyerId;
  if (filters.rating) where.rating = filters.rating;
  if (filters.orderId) where.orderId = filters.orderId;

  return await models.Review.findAll({
    where,
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
      {
        model: models.User,
        as: 'buyer',
        attributes: ['id', 'name', 'phone', 'role'],
      },
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get a single review by ID.
 * Public read access.
 * @param {string} id - Review UUID
 * @returns {Object} Review with order, buyer, and fisher info
 */
const getReviewById = async (id) => {
  const review = await models.Review.findByPk(id, {
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
      {
        model: models.User,
        as: 'buyer',
        attributes: ['id', 'name', 'phone', 'role'],
      },
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });

  if (!review) {
    throw new NotFoundError('Review not found.');
  }

  return review;
};

/**
 * Update a review.
 * Only the buyer who owns the review or admin can update.
 * @param {string} id - Review UUID
 * @param {Object} data - { rating, comment }
 * @param {Object} user - Authenticated user { id, role }
 * @returns {Object} Updated review
 */
const updateReview = async (id, data, user) => {
  const review = await models.Review.findByPk(id, {
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
      {
        model: models.User,
        as: 'buyer',
        attributes: ['id', 'name', 'phone', 'role'],
      },
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });

  if (!review) {
    throw new NotFoundError('Review not found.');
  }

  // Only the review owner (buyer) or admin can update
  if (review.buyerId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to update this review.');
  }

  // Validate rating if provided
  const updateData = {};
  if (data.rating !== undefined && data.rating !== null) {
    const parsedRating = parseInt(data.rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      throw new ValidationError('Rating must be an integer between 1 and 5.');
    }
    updateData.rating = parsedRating;
  }

  // Update comment if provided
  if (data.comment !== undefined) {
    updateData.comment = data.comment;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('Nothing to update. Provide rating or comment.');
  }

  await review.update(updateData);

  // Return updated review
  return await models.Review.findByPk(id, {
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
      {
        model: models.User,
        as: 'buyer',
        attributes: ['id', 'name', 'phone', 'role'],
      },
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });
};

/**
 * Delete a review.
 * Only the buyer who owns the review or admin can delete.
 * @param {string} id - Review UUID
 * @param {Object} user - Authenticated user { id, role }
 * @returns {boolean} True if deletion succeeded
 */
const deleteReview = async (id, user) => {
  const review = await models.Review.findByPk(id);

  if (!review) {
    throw new NotFoundError('Review not found.');
  }

  // Only the review owner (buyer) or admin can delete
  if (review.buyerId !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to delete this review.');
  }

  await review.destroy();

  return true;
};

/**
 * Get average rating for a fisher.
 * @param {string} fisherId - UUID of the fisher
 * @returns {Object} { averageRating, totalReviews }
 */
const getFisherRating = async (fisherId) => {
  const reviews = await models.Review.findAll({
    where: { fisherId },
    attributes: ['rating'],
  });

  if (reviews.length === 0) {
    return { averageRating: null, totalReviews: 0 };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = parseFloat((totalRating / reviews.length).toFixed(2));

  return { averageRating, totalReviews: reviews.length };
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getFisherRating,
};