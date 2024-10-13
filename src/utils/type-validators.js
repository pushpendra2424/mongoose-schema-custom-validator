const mongoose = require("mongoose");
const { generateValidationError } = require("./error-messages");

/**
 * Validate the type of the value based on the expected type.
 * @param {any} value - The value to validate.
 * @param {any} expectedType - The expected type.
 * @param {string} path - The key path for the current value.
 * @returns {Array} - Array of errors.
 */
const validateType = (value, expectedType, path) => {
  const errors = [];

  if (expectedType?.schemaName === "ObjectId") {
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      errors.push(generateValidationError(path, "ObjectId", value));
    }
  } else if (expectedType === String && typeof value !== "string") {
    errors.push(generateValidationError(path, "string", value));
  } else if (expectedType === Number && typeof value !== "number") {
    errors.push(generateValidationError(path, "number", value));
  } else if (expectedType === Boolean && typeof value !== "boolean") {
    errors.push(generateValidationError(path, "boolean", value));
  } else if (expectedType === Date) {
    const parsedDate = new Date(value);

    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
      errors.push(generateValidationError(path, "date", value));
    }
  }
  return errors;
};

/**
 * Validate items in an array based on the expected type.
 * @param {Array} array - The array to validate.
 * @param {any} itemType - The expected type of the items.
 * @param {string} path - The key path for the current value.
 * @returns {Array} - Array of errors.
 */
const validateArrayItems = (array, itemType, path) => {
  const errors = [];
  if (!Array.isArray(array)) {
    errors.push(generateValidationError(path, "array", array));
    return errors;
  }
  for (const item of array) {
    if (itemType?.schemaName === "ObjectId") {
      if (item && !mongoose.Types.ObjectId.isValid(item)) {
        errors.push({
          path,
          message: `each item in '${path}' must be of type 'ObjectId', received '${typeof item}'`,
        });
      }
    }
    else if (itemType === String && typeof item !== "string") {
      errors.push({
        path,
        message: `each item in '${path}' must be of type 'string', received '${typeof item}'`,
      });
    } else if (itemType === Number && typeof item !== "number") {
      errors.push({
        path,
        message: `each item in '${path}' must be of type 'number', received '${typeof item}'`,
      });
    } else if (itemType === Boolean && typeof item !== "boolean") {
      errors.push({
        path,
        message: `each item in '${path}' must be of type 'boolean', received '${typeof item}'`,
      });
    } else if (itemType === Date) {
      console.log('item: ', item);
      if (typeof item === "number" || typeof item === "boolean") {
        errors.push({
          path,
          message: `each item in '${path}' must be of type 'date', received '${typeof item}'`,
        });
      } else {
        const parsedDate = new Date(item);
        console.log('parsedDate: ', parsedDate);

        if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
          errors.push({
            path,
            message: `each item in '${path}' must be of type 'date', received '${typeof item}'`,
          });
        }
      }
    }

    // Additional nested item validations can be added here
  }

  return errors;
};

module.exports = { validateType, validateArrayItems };
