const ResponseFormatter = require('../utils/responseFormatter');

// Helper Function to Format Validation Errors
const formatValidationError = (error) =>
{
    return error.details.map((detail) => ({
        field: detail.context.key,
        message: detail.message,
    }));
};

// Helper Function to Handle Validation Errors
const handleValidationError = (res, error) =>
{
    const errors = formatValidationError(error);
    return ResponseFormatter.error(res, 'Validation Error', 400, errors);
};

// Middleware Function for Joi Validation
const validateRequest = (schema) =>
{
    return async (req, res, next) =>
    {
        try
        {
            await schema.validateAsync(req.body, { abortEarly: false });
            next();
        } catch (error)
        {
            return handleValidationError(res, error);
        }
    };
};

// Direct Validation Function for Handling File Upload with Req.body
validateRequest.validate = async (schema, req, res) =>
{
    try
    {
        const result = await schema.validateAsync(req.body, { abortEarly: false });
        return { isValid: true, data: result };
    } catch (error)
    {
        handleValidationError(res, error);
        return { isValid: false };
    }
};

// Generic Helper Function for Custom Validations or Conditions
validateRequest.checkCondition = (condition, field, errorMessage, res) =>
{
    if (!condition)
    {
        return ResponseFormatter.error(res, 'Validation Error', 400, [
            { field, message: errorMessage },
        ]);
    }
    return { isValid: true };
};

module.exports = validateRequest;
