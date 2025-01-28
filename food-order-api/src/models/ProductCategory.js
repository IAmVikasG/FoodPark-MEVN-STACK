const pool = require('../config/database');
const PaginationHelper = require('../helpers/paginationHelper');

class ProductCategory
{
    /**
     * Get paginated categories
     * @param {object} options - Options for pagination, search, and filters
     * @returns {object} Paginated response
     */
    static async getAll(options)
    {
        const pagination = new PaginationHelper(options);

        // Generate WHERE clause and parameters
        const { whereClause, params } = pagination.getWhereClause(['name', 'description']);

        // Query to count total records
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM product_categories ${whereClause}`,
            params
        );
        const totalRecords = countRows[0].total;

        // Query to fetch paginated data
        const [data] = await pool.execute(
            `SELECT * FROM product_categories ${whereClause} ${pagination.getOrderByClause()} ${pagination.getLimitOffset()}`,
            params
        );

        // Format and return paginated response
        return pagination.formatResponse(data, totalRecords);
    }

    static async create(data)
    {
        const { name, slug, description, parent_id, status } = data;

        const [result] = await pool.execute(
            `INSERT INTO product_categories (name, slug, description, parent_id, status)
             VALUES (?, ?, ?, ?, ?)`,
            [name, slug, description, parent_id, status]
        );

        return this.findById(result.insertId);
    }

    static async findById(id)
    {
        const [rows] = await pool.execute('SELECT * FROM product_categories WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async update(id, data)
    {
        const updateFields = Object.entries(data)
            .map(([key, _]) => `${key} = ?`)
            .join(', ');

        const values = Object.values(data);

        await pool.execute(
            `UPDATE product_categories
             SET ${updateFields}, updated_at = NOW()
             WHERE id = ?`,
            [...values, id]
        );

        return this.findById(id);
    }

    static async delete(id)
    {
        const [result] = await pool.execute('DELETE FROM product_categories WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Fetch function to get children from the database
    static async fetchChildren(parentId)
    {
        const [rows] = await pool.execute(
            'SELECT * FROM product_categories WHERE parent_id = ?',
            [parentId]
        );
        return rows;
    };

    // Fetch function to get a parent from the database
    static async fetchParent(childId)
    {
        const [rows] = await pool.execute(
            'SELECT * FROM product_categories WHERE id = (SELECT parent_id FROM product_categories WHERE id = ?)',
            [childId]
        );
        return rows[0];
    };
}

module.exports = ProductCategory;
