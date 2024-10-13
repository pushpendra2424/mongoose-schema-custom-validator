const { validateType, validateArrayItems } = require("./utils/type-validators");
const { isValidMongooseSchema } = require("./utils/mongoose-instance");
const {
  sendSchemaValidationError,
  sendBadRequestError,
  sendUnprocessableEntityError,
} = require("./utils/error-handler");


/**
* Recursively validates the payload against the schema rules.
* @param {Object} payload - The data being validated.
* @param {Object} rules - The schema rules.
* @param {String} basePath - The path for nested keys (used for error messages).
* @returns {Array} - An array of error objects.
*/
const validate = (payload, rules, basePath = '') => {
  const errors = [];

  // Check for additional properties not defined in schema
  for (const key in payload) {
    if (!(key in rules)) {
      errors.push({
        path: `${basePath ? `${basePath}.` : ''}${key}`,
        message: `must NOT have additional properties`,
      });
    }
  }

  for (const key in rules) {
    const rule = rules[key];
    const value = payload[key];

    // Convert Mongoose types to object-based rules
    const expectedType =
      typeof rule === "function"
        ?
        { type: rule }
        : rule;

    // Check for required fields
    if (expectedType?.required && !(key in payload)) {
      errors.push({
        path: basePath ? `${basePath}.${key}` : key,
        message: `must have required property '${key}'`,
      });
      continue; // Skip further checks for required fields
    }

    // If key exists, validate its type
    if (key in payload) {
      // Recursively validate nested objects
      if (typeof value === "object" && !Array.isArray(value)) {

        const nestedErrors = validate(
          value,
          expectedType || {},
          basePath ? `${basePath}.${key}` : key
        );
        errors.push(...nestedErrors);
      }
      // Validate items in arrays
      else if (Array.isArray(expectedType.type)) {
        const itemType = expectedType.type[0];
        errors.push(
          ...validateArrayItems(
            value,
            itemType,
            basePath ? `${basePath}.${key}` : key
          )
        );
        
      }
      errors.push(
        ...validateType(value, expectedType.type, basePath ? `${basePath}.${key}` : key)
      );


      // Check for enum values
      if (rule.enum) {
        const values = Array.isArray(value) ? value : [value];
        const invalidItems = values.filter(ele => !rule.enum.includes(ele));

        if (invalidItems.length) {
          errors.push({
            path: basePath ? `${basePath}.${key}` : key,
            message: `must be one of the following values: ${rule.enum.join(', ')}`,
          });
        }
      }
    }
  }
  return errors;
};




/**
 * Middleware to validate incoming request payload against the provided Mongoose schema.
 * @param {Object} mongooseSchema - The Mongoose schema to validate against.
 * @returns {Function} - Express middleware function.
 */
const validatePayload = (mongooseSchema) => {
  return (req, res, next) => {
    // Ensure mongooseSchema is the schema object, not a model
    mongooseSchema = mongooseSchema.schema || mongooseSchema;
    const isValidMongooseObject = isValidMongooseSchema(mongooseSchema);

    if (!isValidMongooseObject) {
      return sendSchemaValidationError(res);
    }

    const schema = mongooseSchema.obj;

    // Get payload from request
    const payload = req.body;

    // Validate payload presence and non-empty
    if (!payload || (typeof payload === "object" && Object.keys(payload).length === 0)) {
      return sendBadRequestError(res);
    }

    // Validate payload against schema
    const errors = validate(payload, schema);

    // If there are validation errors, respond with errors
    if (errors.length) {
      return sendUnprocessableEntityError(res, errors);
    }

    next(); // Proceed to the next middleware if validation passes
  };
};

module.exports = validatePayload;
