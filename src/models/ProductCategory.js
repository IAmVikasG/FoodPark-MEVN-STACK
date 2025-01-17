const pool = require('../config/database');

class ProductCategory
{
    static async getAll()
    {
        const [rows] = await pool.execute('SELECT * FROM product_categories');
        return rows;
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
}

module.exports = ProductCategory;
