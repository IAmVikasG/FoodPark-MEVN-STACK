class CustomError extends Error
{
    constructor(message, statusCode = 500, errors = null)
    {
        super(message);

        // Maintain proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true; // Used to distinguish operational errors from programmer errors
    }

    static badRequest(message = 'Bad Request', errors = null)
    {
        return new CustomError(message, 400, errors);
    }

    static unauthorized(message = 'Unauthorized')
    {
        return new CustomError(message, 401);
    }

    static forbidden(message = 'Forbidden')
    {
        return new CustomError(message, 403);
    }

    static notFound(message = 'Not Found')
    {
        return new CustomError(message, 404);
    }

    static tooManyRequests(message = 'Too Many Requests')
    {
        return new CustomError(message, 429);
    }

    static internal(message = 'Internal Server Error')
    {
        return new CustomError(message, 500);
    }
}

module.exports = CustomError;
