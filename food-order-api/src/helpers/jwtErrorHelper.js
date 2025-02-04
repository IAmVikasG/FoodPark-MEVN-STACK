const ResponseFormatter = require('../utils/responseFormatter');

const handleTokenError = (error, res) =>
{
    const message = error.name === 'JsonWebTokenError' ? 'Invalid token' :
        error.name === 'TokenExpiredError' ? 'Token expired' : 'Unauthorized';
    const status = error.name === 'TokenExpiredError' ? 401 : 401;
    return ResponseFormatter.error(res, message, status);
};

module.exports = { handleTokenError };
