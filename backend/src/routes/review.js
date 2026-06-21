/**
 * Aqualink - Review Routes
 *
 * Route definitions for review CRUD and fisher rating endpoints.
 * All mounted under /api/reviews.
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createReviewSchema, updateReviewSchema, idParamSchema, fisherIdParamSchema } = require('../validations');

// POST /api/reviews — Create a review (buyer only)
router.post('/', authenticate, authorize('buyer'), validate(createReviewSchema), reviewController.createReview);

// GET /api/reviews — Get all reviews (public)
router.get('/', reviewController.getReviews);

// GET /api/reviews/fisher/:fisherId/rating — Get average fisher rating (public)
router.get('/fisher/:fisherId/rating', validate(fisherIdParamSchema, 'params'), reviewController.getFisherRating);

// GET /api/reviews/:id — Get a single review (public)
router.get('/:id', validate(idParamSchema, 'params'), reviewController.getReviewById);

// PATCH /api/reviews/:id — Update a review (buyer owner or admin)
router.patch('/:id', authenticate, validate(idParamSchema, 'params'), validate(updateReviewSchema), reviewController.updateReview);

// DELETE /api/reviews/:id — Delete a review (buyer owner or admin)
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), reviewController.deleteReview);

module.exports = router;