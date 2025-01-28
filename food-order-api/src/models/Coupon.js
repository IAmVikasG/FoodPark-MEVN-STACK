const pool = require('../config/database');

class Coupon
{
    static async create(data)
    {
        const { name, code, quantity, minimum_purchase_price, expiry, discount_type, discount_amount, status } = data;

        const [result] = await pool.execute(
            'INSERT INTO coupons (name, code, quantity, minimum_purchase_price, expiry, discount_type, discount_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, code, quantity, minimum_purchase_price, expiry, discount_type, discount_amount, status]
        );

        return this.findById(result.insertId);
    }

    static async findById(id)
    {
        const [rows] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, data)
    {
        const { name, code, quantity, minimum_purchase_price, expiry, discount_type, discount_amount, status } = data;

        await pool.execute(
            'UPDATE coupons SET name = ?, code = ?, quantity = ?, minimum_purchase_price = ?, expiry = ?, discount_type = ?, discount_amount = ?, status = ? WHERE id = ?',
            [name, code, quantity, minimum_purchase_price, expiry, discount_type, discount_amount, status, id]
        );

        return this.findById(id);
    }

    static async delete(id)
    {
        await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);
    }

    static async getAll()
    {
        const [rows] = await pool.execute('SELECT * FROM coupons');
        return rows;
    }
}

module.exports = Coupon;
