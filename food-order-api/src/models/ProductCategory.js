const pool = require('../config/database');
const DataTableService = require('../services/dataTableService');

class ProductCategory
{

    static async getAll(options)
    {
        const dataTableService = new DataTableService({
            baseQuery: 'SELECT * FROM product_categories',
            searchColumns: ['name'], // Add other searchable columns
            defaultOrder: { column: 'created_at', dir: 'desc' }
        });

        const {
            query,
            countQuery,
            queryParams,
            countParams,
            draw,
            page,
            limit,
            order
        } = await dataTableService.process(options);


        // Execute both queries in parallel
        const [data, totalRecords, filteredRecords] = await Promise.all([
            this.executeQuery(query, queryParams),
            this.getTotalRecords(),
            this.executeCountQuery(countQuery, countParams)
        ]);

        return {
            data,
            draw: parseInt(draw),
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            order, // Pass the order property
            page,
            limit
        };
    }

    static async executeQuery(query, params)
    {
        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async executeCountQuery(query, params)
    {
        const [result] = await pool.execute(query, params);
        return result[0].total;
    }

    static async getTotalRecords()
    {
        const [result] = await pool.execute('SELECT COUNT(*) as total FROM product_categories');
        return result[0].total;
    }

    static async getAllParentCategories()
    {
        return await this.executeQuery('SELECT id, name FROM product_categories WHERE parent_id IS NULL', []);
    }

    static async create(data)
    {
        const { name, slug, description, parent_id = null, status } = data;

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
