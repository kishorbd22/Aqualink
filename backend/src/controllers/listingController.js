/**
 * Aqualink - Listing Controller
 *
 * Request handlers for fish listing CRUD endpoints.
 */

const listingService = require('../services/listingService');
const { ValidationError } = require('../utils/errors');

/**
 * POST /api/listings
 * Create a new fish listing. Requires authentication (fisher role).
 */
const createListing = async (req, res, next) => {
  try {
    const { species, weight, pricePerKg, freshnessTimestamp, photoUrl } = req.body;

    // Validate required fields
    if (!species || !weight || !pricePerKg || !freshnessTimestamp) {
      throw new ValidationError('Species, weight, pricePerKg, and freshnessTimestamp are required.');
    }

    const listing = await listingService.createListing(
      { species, weight, pricePerKg, freshnessTimestamp, photoUrl },
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Fish listing created successfully.',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/listings
 * Get all listings with optional filters (query params).
 */
const getListings = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      species: req.query.species,
      fisherId: req.query.fisherId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) delete filters[key];
    });

    const listings = await listingService.getListings(filters);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: { listings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/listings/:id
 * Get a single listing by ID.
 */
const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await listingService.getListingById(id);

    res.status(200).json({
      success: true,
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/listings/:id
 * Update a listing. Only the owning fisher can update.
 */
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await listingService.updateListing(id, req.body, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/listings/:id
 * Delete a listing. Only the owning fisher can delete.
 */
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    await listingService.deleteListing(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
};