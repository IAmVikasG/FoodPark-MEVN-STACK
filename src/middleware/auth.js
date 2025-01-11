const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const CustomError = require('../utils/customError');
const ResponseFormatter = require('../utils/responseFormatter');

// Helper function to handle JWT token verification
const verifyToken = async (token) =>
{
    if (!token)
    {
        throw new CustomError('Authentication required', 401);
    }
    try
    {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error)
    {
        throw error; // Propagate JWT errors to be handled by handleTokenError
    }
};

// Helper function to fetch user roles and their permissions
const fetchUserRolesAndPermissions = async (userId) =>
{
    try
    {
        const [results] = await pool.query(`
            SELECT DISTINCT
                r.name as role_name,
                p.name as permission_name
            FROM users u
            INNER JOIN user_roles ur ON u.id = ur.user_id
            INNER JOIN roles r ON ur.role_id = r.id
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = ?
        `, [userId]);

        if (!results.length)
        {
            throw new CustomError('User has no roles or permissions', 403);
        }

        const userRoles = [...new Set(results.map(item => item.role_name))];
        const permissions = [...new Set(results.map(item => item.permission_name).filter(Boolean))];

        return { userRoles, permissions };
    } catch (error)
    {
        throw new CustomError('Error fetching user roles', 500);
    }
};

// Error handler for token-related errors
const handleTokenError = (error, res, next) =>
{
    if (error.name === 'JsonWebTokenError')
    {
        return ResponseFormatter.error(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError')
    {
        return ResponseFormatter.error(res, 'Token expired', 401);
    }
    // For other errors, pass to the global error handler
    next(error);
};

// Authentication middleware - only checks if the user is authenticated
const authenticate = async (req, res, next) =>
{
    try
    {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = await verifyToken(token);

        // Store decoded user ID in request for later use
        req.userId = decoded.id;
        next();
    } catch (error)
    {
        return handleTokenError(error, res, next);
    }
};

// Authorization middleware - checks roles and permissions
const authorize = (allowedRoles) =>
{
    // Convert single role to array if needed
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async (req, res, next) =>
    {
        try
        {
            if (!req.userId)
            {
                throw new CustomError('User not authenticated', 401);
            }

            const { userRoles, permissions } = await fetchUserRolesAndPermissions(req.userId);

            // Check if user has any of the allowed roles
            const hasRole = roles.some(role => userRoles.includes(role));

            if (!hasRole)
            {
                throw new CustomError(
                    `Access denied. Required roles: ${roles.join(', ')}`,
                    403
                );
            }

            // Attach user info to request object
            req.user = {
                id: req.userId,
                roles: userRoles,
                permissions: permissions
            };

            next();
        } catch (error)
        {
            if (error instanceof CustomError)
            {
                return ResponseFormatter.error(res, error.message, error.statusCode);
            }
            next(error);
        }
    };
};

module.exports = {
    authenticate,
    authorize
};
