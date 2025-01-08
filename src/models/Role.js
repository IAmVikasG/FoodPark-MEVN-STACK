const pool = require('../config/database');

class Role
{
    static async findByName(name)
    {
        const [rows] = await pool.execute(
            'SELECT * FROM roles WHERE name = ?',
            [name]
        );
        return rows[0];
    }

    static async assignUserRole(userId, roleId)
    {
        await pool.execute(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleId]
        );
    }

    static async getDefaultCustomerRole()
    {
        const [roles] = await pool.execute(
            'SELECT id FROM roles WHERE name = ?',
            ['customer']
        );

        if (!roles.length)
        {
            throw new Error('Default customer role not found');
        }

        return roles[0];
    }

    static async getUserRoles(userId)
    {
        const [rows] = await pool.execute(`
            SELECT r.name as role_name
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?`,
            [userId]
        );
        return rows;
    }
}

module.exports = Role;
