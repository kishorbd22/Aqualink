/**
 * Aqualink - Listing Routes
 *
 * Route definitions for fish listing CRUD endpoints.
 * All mounted under /api/listings.
 */

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/listings — Create a listing (fisher only)
router.post('/', authenticate, authorize('fisher', 'admin'), listingController.createListing);

// GET /api/listings — Get all listings (public with optional filters)
router.get('/', listingController.getListings);

// GET /api/listings/:id — Get a single listing (public)
router.get('/:id', listingController.getListingById);

// PUT /api/listings/:id — Update a listing (owner or admin)
router.put('/:id', authenticate, listingController.updateListing);

// DELETE /api/listings/:id — Delete a listing (owner or admin)
router.delete('/:id', authenticate, listingController.deleteListing);

module.exports = router;