const ResponseFormatter = require('../utils/responseFormatter');

const validateRequest = (schema) =>
{
    return (req, res, next) =>
    {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error)
        {
            const errors = error.details.map(detail => ({
                field: detail.context.key,
                message: detail.message
            }));

            return ResponseFormatter.error(
                res,
                'Validation Error',
                400,
                errors
            );
        }

        next();
    };
};

module.exports = validateRequest;
