const { ERROR_MESSAGES } = require("./error-messages");

/**
 * Sends a standardized schema validation error response.
 * @param {Object} res - Express response object.
 */
const sendSchemaValidationError = (res) => {
  return res.status(400).json({
    error: ERROR_MESSAGES.SCHEMA_VALIDATION_FAILED,
  });
};

/**
 * Sends a bad request error response.
 * @param {Object} res - Express response object.
 */
const sendBadRequestError = (res) => {
  return res.status(400).json({
    error: ERROR_MESSAGES.BAD_REQUEST,
  });
};

/**
 * Sends an unprocessable entity error response with details.
 * @param {Object} res - Express response object.
 * @param {Array} details - Detailed errors for unprocessable entity.
 */
const sendUnprocessableEntityError = (res, details) => {
  return res.status(422).json({
    error: {
      ...ERROR_MESSAGES.UNPROCESSABLE_ENTITY,
      details,
    },
  });
};

module.exports = {
  sendSchemaValidationError,
  sendBadRequestError,
  sendUnprocessableEntityError,
};
