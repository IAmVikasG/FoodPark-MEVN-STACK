const pool = require('../config/database');
const CustomError = require('../utils/customError');

const fetchUserRolesAndPermissions = async (userId) =>
{
    const [results] = await pool.query(`
        SELECT DISTINCT r.name AS role_name, p.name AS permission_name
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
};

module.exports = { fetchUserRolesAndPermissions };
