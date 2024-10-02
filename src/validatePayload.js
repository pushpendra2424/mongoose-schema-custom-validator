// Import the function to check if a Mongoose schema is valid
// const isValidMongooseSchema = require('./check-mongoose-instance');

// /**
//  * Validates the incoming request payload against the provided schema.
//  * @param {Object} schema - The schema to validate against.
//  * @param {Object} options - Options to control validation behavior.
//  * @returns {Function} - Express middleware function.
//  */

const validatePayload = (
    mongooseSchema,
    options = { continueOnError: false }
) => {
    // Check if the provided schema is a valid Mongoose schema

    // const isValidMongooseObject = isValidMongooseSchema(mongooseSchema);
    // console.log('isValidMongooseObject: ', isValidMongooseObject);
    // if (!isValidMongooseObject) {
    //     return (req, res) => {
    //         return res.status(400).json({
    //             error: {
    //                 statusCode: 400,
    //                 name: 'BadRequestError',
    //                 message: 'Schema validation failed.',
    //                 details: {
    //                     message: 'The provided schema does not conform to Mongoose schema standards.',
    //                     possibleCauses: [
    //                         'Schema is not an object.',
    //                         'Required fields are missing.',
    //                         'Field types are not valid.',
    //                         'Enum values are not correctly defined.',
    //                         'There may be circular references.',
    //                     ],
    //                     suggestion: 'Please review your schema definition for compliance with Mongoose schema standards.',
    //                 },
    //             },
    //         });
    //     };
    // }

    const schema = mongooseSchema.obj;

    // Function to validate the payload against the schema
    const validate = (payload, rules, basePath) => {
        const errors = [];

        for (const key in rules) {
            const rule = rules[key];
            const value = payload[key];

            // Check for required fields
            if (rule.required && !(key in payload)) {
                errors.push({
                    path: basePath ? `${basePath}.${key}` : key,
                    message: `must have required property '${key}'`,
                });
            }

            // Type validation
            if (key in payload) {
                const expectedType = rule.type;

                // Validate type
                errors.push(
                    ...validateType(
                        value,
                        expectedType,
                        basePath ? `${basePath}.${key}` : key
                    )
                );

                // Handle nested objects
                if (
                    expectedType === Object &&
                    typeof value === 'object' &&
                    !Array.isArray(value)
                ) {
                    const nestedErrors = validate(
                        value,
                        rule.properties,
                        basePath ? `${basePath}.${key}` : key
                    );
                    errors.push(...nestedErrors);
                } else if (Array.isArray(expectedType) && Array.isArray(value)) {
                    // Handle arrays
                    const itemType = expectedType[0];
                    errors.push(
                        ...validateArrayItems(
                            value,
                            itemType,
                            basePath ? `${basePath}.${key}` : key
                        )
                    );
                }

                // Check for enum values
                if (rule.enum && !rule.enum.includes(value)) {
                    errors.push({
                        path: basePath ? `${basePath}.${key}` : key,
                        message: `must be one of the following values: ${rule.enum.join(', ')}`,
                    });
                }
            }
        }

        return errors;
    };

    // Function to validate individual types
    const validateType = (value, expectedType, path) => {
        const errors = [];

        if (expectedType === String && typeof value !== 'string') {
            errors.push({
                path,
                message: `must be of type 'string', received '${typeof value}'`,
            });
        } else if (expectedType === Number && typeof value !== 'number') {
            errors.push({
                path,
                message: `must be of type 'number', received '${typeof value}'`,
            });
        } else if (expectedType === Boolean && typeof value !== 'boolean') {
            errors.push({
                path,
                message: `must be of type 'boolean', received '${typeof value}'`,
            });
        } else if (
            expectedType === Date &&
            !(value instanceof Date || !isNaN(Date.parse(value)))
        ) {
            errors.push({
                path,
                message: `must be a valid 'Date', received '${value}'`,
            });
        } else if (expectedType === Object && typeof value !== 'object') {
            errors.push({
                path,
                message: `must be of type 'object', received '${typeof value}'`,
            });
        }

        return errors;
    };

    // Function to validate array items
    const validateArrayItems = (array, itemType, path) => {
        const errors = [];

        for (const item of array) {
            // Validate each item based on its expected type
            if (itemType === String && typeof item !== 'string') {
                errors.push({
                    path,
                    message: `each item in '${path}' must be of type 'string', received '${typeof item}'`,
                });
            } else if (itemType === Number && typeof item !== 'number') {
                errors.push({
                    path,
                    message: `each item in '${path}' must be of type 'number', received '${typeof item}'`,
                });
            } else if (itemType === Boolean && typeof item !== 'boolean') {
                errors.push({
                    path,
                    message: `each item in '${path}' must be of type 'boolean', received '${typeof item}'`,
                });
            } else if (itemType === Object && typeof item === 'object') {
                // Validate properties of the nested object
                const nestedErrors = validate(item, {}, path); // Pass an empty object to avoid type validation
                errors.push(...nestedErrors);
            } else if (Array.isArray(itemType) && Array.isArray(item)) {
                // If the item is an array, recursively validate its items
                const nestedItemType = itemType[0];
                errors.push(...validateArrayItems(item, nestedItemType, path));
            }
            // Additional item type checks can be added here as needed
        }

        return errors;
    };

    return (req, res, next) => {
        const payload = req.body;

        // Check if request body is undefined or an empty object
        if (
            !payload ||
            (typeof payload === 'object' && Object.keys(payload).length === 0)
        ) {
            return res.status(400).json({
                error: {
                    statusCode: 400,
                    name: 'BadRequestError',
                    message: 'Request body is required and cannot be empty.',
                },
            });
        }

        const errors = validate(payload, schema);

        // Check for any additional properties not defined in the schema
        for (const key in payload) {
            if (!(key in schema)) {
                errors.push({
                    path: key,
                    message: `must NOT have additional properties`,
                });
            }
        }

        // If any validation errors were found, respond with a 422 error
        if (errors.length) {
            return res.status(422).json({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    details: errors,
                },
            });
        }

        // If all checks pass, proceed to the next middleware
        next();
    };
};

module.exports = validatePayload;
