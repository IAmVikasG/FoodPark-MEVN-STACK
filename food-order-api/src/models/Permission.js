const pool = require("../config/database");
const PaginationHelper = require('../helpers/paginationHelper');

class Permission
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
            `SELECT COUNT(*) as total FROM permissions ${whereClause}`,
            params
        );
        const totalRecords = countRows[0].total;

        // Query to fetch paginated data
        const [data] = await pool.execute(
            `SELECT * FROM permissions ${whereClause} ${pagination.getSortKeyClause()} ${pagination.getLimitOffset()}`,
            params
        );

        // Format and return paginated response
        return pagination.formatResponse(data, totalRecords);
    }

    static async create(data)
    {
        const { name, description = null } = data;
        const [permissionResult] = await pool.execute(
            "INSERT INTO permissions (name, description) VALUES (?, ?)",
            [name, description]
        );

        return this.findById(permissionResult.insertId); // Return the newly created permission

    }

    static async findById(id)
    {
        const [rows] = await pool.execute(
            "SELECT * FROM permissions WHERE id = ?",
            [id]
        );
        return rows[0] || null; // Return null if no permission found
    }

    static async findByName(name)
    {
        const [rows] = await pool.execute(
            "SELECT * FROM permissions WHERE name = ?",
            [name]
        );
        return rows[0] || null;
    }

    static async update(id, data)
    {
        const { name, description = null } = data;
        await pool.execute(
            "UPDATE permissions SET name = ?, description = ? WHERE id = ?",
            [name, description, id]
        );
        return this.findById(id);
    }

    static async delete(id)
    {
        await pool.execute("DELETE FROM permissions WHERE id = ?", [id]);
    }
}

module.exports = Permission;
