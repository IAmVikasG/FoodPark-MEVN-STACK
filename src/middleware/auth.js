const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CustomError = require('../utils/customError');
const ResponseFormatter = require('../utils/responseFormatter');

const auth = async (req, res, next) =>
{
    try
    {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token)
        {
            throw new CustomError('Authentication required', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user)
        {
            throw new CustomError('User not found', 401);
        }

        req.user = user;
        next();
    } catch (error)
    {
        if (error.name === 'JsonWebTokenError')
        {
            return ResponseFormatter.error(res, 'Invalid token', 401);
        }
        if (error.name === 'TokenExpiredError')
        {
            return ResponseFormatter.error(res, 'Token expired', 401);
        }
        next(error);
    }
};

module.exports = auth;
