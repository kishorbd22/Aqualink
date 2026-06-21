/**
 * Aqualink - Pagination Utility
 *
 * Shared helpers for paginated, sorted, and filtered collection queries.
 * All existing filters are preserved; pagination & sorting are additive.
 */

/**
 * Extract pagination and sorting options from query parameters with safe defaults.
 *
 * @param {Object} query - Express req.query object
 * @param {Object} [options] - Optional overrides
 * @param {number} [options.maxLimit=100] - Maximum allowed limit
 * @param {string} [options.defaultSortBy='createdAt'] - Default sort field
 * @param {string} [options.defaultOrder='DESC'] - Default sort direction
 * @returns {{ page: number, limit: number, offset: number, sortBy: string, order: string }}
 */
const extractPagination = (query, options = {}) => {
  const {
    maxLimit = 100,
    defaultSortBy = 'createdAt',
    defaultOrder = 'DESC',
  } = options;

  // Page: must be a positive integer, default 1
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) page = 1;

  // Limit: must be a positive integer, clamped to maxLimit, default 10
  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  // SortBy: use provided value or default
  const sortBy = query.sortBy || defaultSortBy;

  // Order: must be 'ASC' or 'DESC', default to provided default
  const order = (query.order && query.order.toUpperCase() === 'ASC') ? 'ASC' : defaultOrder;

  return { page, limit, offset, sortBy, order };
};

/**
 * Build a Sequelize `order` array from sortBy and order direction.
 * Optionally prefix the sort field with a model name for joined columns.
 *
 * @param {string} sortBy - Column name to sort by
 * @param {string} order - 'ASC' or 'DESC'
 * @param {string|null} modelName - Optional model name for joined sort (e.g. 'listing')
 * @returns {Array} Sequelize-compatible order array
 */
const buildOrder = (sortBy, order, modelName = null) => {
  if (modelName) {
    return [[{ model: modelName, as: modelName }, sortBy, order]];
  }
  return [[sortBy, order]];
};

/**
 * Build the pagination metadata object.
 *
 * @param {number} total - Total number of records
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number, hasNext: boolean, hasPrevious: boolean }}
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 0;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};

module.exports = {
  extractPagination,
  buildOrder,
  buildPaginationMeta,
};