// Error messages for validation and bad requests
const ERROR_MESSAGES = {
  BAD_REQUEST: {
    statusCode: 400,
    name: "BadRequestError",
    message: "Request body is required and cannot be empty.",
  },
  SCHEMA_VALIDATION_FAILED: {
    statusCode: 400,
    name: "BadRequestError",
    message: "Schema validation failed.",
    details: {
      message:
        "The provided schema does not conform to Mongoose schema standards.",
      suggestion:
        "Please review your schema definition for compliance with Mongoose schema standards.",
    },
  },
  UNPROCESSABLE_ENTITY: {
    statusCode: 422,
    name: "UnprocessableEntityError",
    message:
      "The request body is invalid. See error object `details` property for more info.",
  },
};
/**
 * Generates a validation error message.
 * @param {string} path - The key path for the current value.
 * @param {string} expectedType - The expected type of the value.
 * @param {any} receivedValue - The value that was received.
 * @returns {Object} - The error message object.
 */
const generateValidationError = (path, expectedType, receivedValue) => {
  return {
    path,
    message: `must be of type '${expectedType}', received '${typeof receivedValue}'`,
  };
};

module.exports = { ERROR_MESSAGES, generateValidationError };
