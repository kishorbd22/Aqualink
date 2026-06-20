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

// POST /api/reviews — Create a review (buyer only)
router.post('/', authenticate, authorize('buyer'), reviewController.createReview);

// GET /api/reviews — Get all reviews (public)
router.get('/', reviewController.getReviews);

// GET /api/reviews/fisher/:fisherId/rating — Get average fisher rating (public)
router.get('/fisher/:fisherId/rating', reviewController.getFisherRating);

// GET /api/reviews/:id — Get a single review (public)
router.get('/:id', reviewController.getReviewById);

// PATCH /api/reviews/:id — Update a review (buyer owner or admin)
router.patch('/:id', authenticate, reviewController.updateReview);

// DELETE /api/reviews/:id — Delete a review (buyer owner or admin)
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;