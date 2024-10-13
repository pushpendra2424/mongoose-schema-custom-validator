/**
 * Checks if the provided schema is a valid Mongoose schema instance.
 * @param {any} schema - The schema to check.
 * @returns {boolean} - Returns true if it's a valid Mongoose schema, false otherwise.
 */
function isValidMongooseSchema(schema) {
  // const gooseObject = mongooseSchema && mongooseSchema.obj && typeof mongooseSchema.obj === 'object';
  return schema && schema.constructor && schema.constructor.name === 'Schema';
}

module.exports = { isValidMongooseSchema };
