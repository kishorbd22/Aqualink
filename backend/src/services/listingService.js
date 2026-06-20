/**
 * Aqualink - Listing Service
 *
 * Business logic for fish listing CRUD operations.
 */
const { Op } = require('sequelize');
const { models } = require('../models');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Create a new fish listing.
 * @param {Object} data - { species, weight, pricePerKg, freshnessTimestamp, photoUrl }
 * @param {string} fisherId - UUID of the authenticated fisher
 * @returns {Object} The created listing with fisher info
 */
const createListing = async (data, fisherId) => {
  const { species, weight, pricePerKg, freshnessTimestamp, photoUrl } = data;

  const listing = await models.Listing.create({
    fisherId,
    species,
    weight,
    pricePerKg,
    freshnessTimestamp,
    photoUrl: photoUrl || null,
    status: 'available',
  });

  // Fetch with fisher details included
  return await models.Listing.findByPk(listing.id, {
    include: [
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });
};

/**
 * Get all listings with optional filtering.
 * @param {Object} filters - { status, species, fisherId, minPrice, maxPrice }
 * @returns {Array} List of listings
 */
const getListings = async (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.species) where.species = { [Op.iLike]: `%${filters.species}%` };
  if (filters.fisherId) where.fisherId = filters.fisherId;
  if (filters.minPrice || filters.maxPrice) {
    where.pricePerKg = {};
    if (filters.minPrice) where.pricePerKg[Op.gte] = parseFloat(filters.minPrice);
    if (filters.maxPrice) where.pricePerKg[Op.lte] = parseFloat(filters.maxPrice);
  }

  console.log(where);
  return await models.Listing.findAll({
    where,
    include: [
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
 * Get a single listing by ID.
 * @param {string} id - Listing UUID
 * @returns {Object} Listing with fisher details
 */
const getListingById = async (id) => {
  const listing = await models.Listing.findByPk(id, {
    include: [
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  return listing;
};

/**
 * Update a listing. Only the owner or an admin can update.
 * @param {string} id - Listing UUID
 * @param {Object} data - Fields to update
 * @param {string} userId - Authenticated user's ID
 * @returns {Object} Updated listing
 */
const updateListing = async (id, data, userId) => {
  const listing = await models.Listing.findByPk(id);

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  // Fetch the user to check admin role
  const user = await models.User.findByPk(userId);

  // Only the owner or an admin can update
  if (listing.fisherId !== userId && user.role !== 'admin') {
    throw new ForbiddenError('You can only update your own listings.');
  }

  // Allowed fields to update
  const allowedFields = ['species', 'weight', 'pricePerKg', 'freshnessTimestamp', 'status', 'photoUrl'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new ValidationError('No valid fields provided for update.');
  }

  await listing.update(updates);

  // Return refreshed listing with fisher details
  return await models.Listing.findByPk(id, {
    include: [
      {
        model: models.User,
        as: 'fisher',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });
};

/**
 * Delete a listing. Only the owner or an admin can delete.
 * @param {string} id - Listing UUID
 * @param {string} userId - Authenticated user's ID
 */
const deleteListing = async (id, userId) => {
  const listing = await models.Listing.findByPk(id);

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  // Fetch the user to check admin role
  const user = await models.User.findByPk(userId);

  // Only the owner or an admin can delete
  if (listing.fisherId !== userId && user.role !== 'admin') {
    throw new ForbiddenError('You can only delete your own listings.');
  }

  await listing.destroy();
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
};