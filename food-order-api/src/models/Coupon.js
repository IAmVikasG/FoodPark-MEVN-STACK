const pool = require('../config/database');
const DataTableService = require('../services/dataTableService');

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

    static async findByName(name)
    {
        const [rows] = await pool.execute('SELECT * FROM coupons WHERE name = ?', [name]);
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

    static async getAll(options)
    {
        const dataTableService = new DataTableService({
            baseQuery: 'SELECT * FROM coupons',
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
        const [result] = await pool.execute('SELECT COUNT(*) as total FROM coupons');
        return result[0].total;
    }
}

module.exports = Coupon;
