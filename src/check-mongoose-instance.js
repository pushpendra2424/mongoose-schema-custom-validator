/**
 * Checks if the provided schema is a valid Mongoose schema instance.
 * @param {any} schema - The schema to check.
 * @returns {boolean} - Returns true if it's a valid Mongoose schema, false otherwise.
 */
const mongoose = require ('mongoose');

function isValidMongooseSchema(schema) {
    return schema instanceof mongoose.Schema;
}

module.exports = isValidMongooseSchema;
