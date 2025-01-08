const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const CustomError = require('../utils/customError');
const ResponseFormatter = require('../utils/responseFormatter');

// Middleware for Role-Based and User-Based Permissions
const roleAndUserPermissionAuth = (requiredPermissionOrRole) =>
{
    return async (req, res, next) =>
    {
        try
        {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token)
            {
                throw new CustomError('Authentication required', 401);
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            // Fetch user's roles and permissions
            const [results] = await pool.query(`
                SELECT DISTINCT r.name AS role, p.name AS permission
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                LEFT JOIN role_permissions rp ON rp.role_id = r.id
                LEFT JOIN permissions p ON rp.permission_id = p.id

                UNION

                SELECT NULL AS role, p.name AS permission
                FROM users u
                LEFT JOIN user_permissions up ON u.id = up.user_id
                LEFT JOIN permissions p ON up.permission_id = p.id

                WHERE u.id = ?;
            `, [userId]);

            // Extract roles and permissions
            const userRoles = results
                .filter((entry) => entry.role)
                .map((entry) => entry.role);

            const userPermissions = results
                .filter((entry) => entry.permission)
                .map((entry) => entry.permission);

            // Check if the requiredPermissionOrRole matches either
            if (
                userRoles.includes(requiredPermissionOrRole) || // Role-based access
                userPermissions.includes(requiredPermissionOrRole) // Permission-based access
            )
            {
                req.user = { id: userId, roles: userRoles, permissions: userPermissions };
                return next();
            }

            // Permission/Role not found
            throw new CustomError(
                `Access denied. Missing required ${requiredPermissionOrRole}.`,
                403
            );
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
};

module.exports = roleAndUserPermissionAuth;
