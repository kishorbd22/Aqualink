/**
 * Aqualink - Review Controller
 *
 * Request handlers for review CRUD and fisher rating endpoints.
 */

const reviewService = require('../services/reviewService');
const { ValidationError } = require('../utils/errors');

/**
 * POST /api/reviews
 * Create a review. Requires authentication (buyer role).
 */
const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || rating === undefined || rating === null) {
      throw new ValidationError('orderId and rating are required.');
    }

    const review = await reviewService.createReview(
      { orderId, rating, comment },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully.',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews
 * Get all reviews with optional filters (query params).
 * Public read access.
 */
const getReviews = async (req, res, next) => {
  try {
    const filters = {
      fisherId: req.query.fisherId,
      buyerId: req.query.buyerId,
      rating: req.query.rating,
      orderId: req.query.orderId,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) delete filters[key];
    });

    const reviews = await reviewService.getReviews(filters);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/:id
 * Get a single review by ID.
 * Public read access.
 */
const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/reviews/:id
 * Update a review. Only the review owner (buyer) or admin can update.
 */
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating === undefined && comment === undefined) {
      throw new ValidationError('Provide at least rating or comment to update.');
    }

    const review = await reviewService.updateReview(id, { rating, comment }, req.user);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id
 * Delete a review. Only the review owner (buyer) or admin can delete.
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReview(id, req.user);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/fisher/:fisherId/rating
 * Get average rating for a fisher.
 * Public read access.
 */
const getFisherRating = async (req, res, next) => {
  try {
    const { fisherId } = req.params;
    const ratingData = await reviewService.getFisherRating(fisherId);

    res.status(200).json({
      success: true,
      data: { rating: ratingData },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getFisherRating,
};