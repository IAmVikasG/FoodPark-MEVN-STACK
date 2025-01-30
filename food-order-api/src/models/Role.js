const pool = require("../config/database");
const PaginationHelper = require('../helpers/paginationHelper');

class Role
{
    /**
     * Get paginated categories
     * @param {object} options - Options for pagination, search, and filters
     * @returns {object} Paginated response
     */
    static async get(options)
    {
        const pagination = new PaginationHelper(options);
        // Generate WHERE clause and parameters
        const { whereClause, params } = pagination.getWhereClause(['name']);

        // Query to count total records
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM roles ${whereClause}`,
            params
        );
        const totalRecords = countRows[0].total;

        // Query to fetch paginated data
        const [data] = await pool.execute(
            `SELECT * FROM roles ${whereClause} ${pagination.getSortKeyClause()} ${pagination.getLimitOffset()}`,
            params
        );

        // Format and return paginated response
        return pagination.formatResponse(data, totalRecords);
    }

    static async create(data)
    {
        const { name, description = null } = data;
        const [roleResult] = await pool.execute(
            "INSERT INTO roles (name, description) VALUES (?, ?)",
            [name, description]
        );

        return this.findById(roleResult.insertId); // Return the newly created role
    }

    static async findById(id)
    {
        const [rows] = await pool.execute(
            "SELECT * FROM roles WHERE id = ?",
            [id]
        );
        return rows[0] || null; // Return null if no role found
    }

    static async findByName(name)
    {
        const [rows] = await pool.execute(
            "SELECT * FROM roles WHERE name = ?",
            [name]
        );
        return rows[0] || null;
    }

    static async assignUserRole(userId, roleId)
    {
        await pool.execute(
            "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
            [userId, roleId]
        );
    }

    static async getDefaultCustomerRole()
    {
        const [roles] = await pool.execute(
            "SELECT id FROM roles WHERE name = ?",
            ["customer"]
        );

        if (!roles.length)
        {
            throw new Error("Default customer role not found");
        }

        return roles[0];
    }

    static async getUserRoles(userId)
    {
        const [rows] = await pool.execute(
            `SELECT r.name as role_name
                FROM roles r
                JOIN user_roles ur ON r.id = ur.role_id
                WHERE ur.user_id = ?`,
            [userId]
        );
        return rows;
    }

    static async update(id, data)
    {
        const { name, description = null } = data;
        await pool.execute(
            "UPDATE roles SET name = ?, description = ? WHERE id = ?",
            [name, description, id]
        );
        return this.findById(id); // Return updated role
    }

    static async delete(id)
    {
        await pool.execute("DELETE FROM roles WHERE id = ?", [id]);
    }
}

module.exports = Role;
