/**
 * Aqualink - Validation Middleware
 *
 * Reusable Express middleware for Joi schema validation.
 * Validates req.body, req.params, and req.query as specified.
 * Returns consistent HTTP 400 errors with the first validation message.
 */

const { ValidationError } = require('../utils/errors');

/**
 * Create a validation middleware for the given Joi schema and source.
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @param {'body'|'params'|'query'} source - Request property to validate (default: 'body')
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: true,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details[0].message;
      return next(new ValidationError(message));
    }

    // Replace the request property with the validated (and stripped) value
    req[source] = value;
    next();
  };
};

module.exports = { validate };