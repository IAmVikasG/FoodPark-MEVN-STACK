const pool = require('../config/database');
const DataTableService = require('../services/dataTableService');

class Slider
{
    static async create(data)
    {
        const connection = await pool.getConnection();

        const { offer, title, subtitle, description, button_link, status, created_by, image_url } = data;

        await connection.beginTransaction();

        // Insert into sliders table
        const [sliderResult] = await connection.execute(
            `INSERT INTO sliders (
                offer,
                title,
                subtitle,
                description,
                button_link,
                status,
                created_by,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [offer, title, subtitle, description, button_link, status, created_by]
        );

        const sliderId = sliderResult.insertId;

        // Insert images into slider_images table if provided
        if (image_url && image_url.length > 0)
        {
            await connection.query(
                `INSERT INTO slider_images (slider_id, image_url) VALUES (?, ?)`,
                [sliderId, image_url]
            );
        }

        await connection.commit();
        connection.release();

        // Return created slider with its images
        return this.findById(sliderId);
    }

    static async findById(id)
    {
        const [rows] = await pool.execute(
            `SELECT sl.id, sl.title, sl.subtitle, sl.description, sl.button_link,
            sl.status, u.name AS created_by, sl.created_at,
            GROUP_CONCAT(si.image_url) AS images
            FROM sliders sl
            JOIN users u ON u.id = sl.created_by
            LEFT JOIN slider_images si ON sl.id = si.slider_id
            WHERE sl.id = ?
            GROUP BY sl.id`,
            [id]
        );

        if (!rows.length) return null;

        return {
            ...rows[0],
            images: rows[0].images ? rows[0].images.split(',') : []
        };
    }

    static async update(id, data)
    {
        const connection = await pool.getConnection();

        const { image_url, ...sliderData } = data;

        await connection.beginTransaction();

        // Update slider basic info
        if (Object.keys(sliderData).length > 0)
        {
            const updateFields = Object.entries(sliderData)
                .map(([key]) => `${key} = ?`)
                .join(', ');

            const values = Object.values(sliderData);

            await connection.execute(
                `UPDATE sliders
                 SET ${updateFields}, updated_at = NOW()
                 WHERE id = ?`,
                [...values, id]
            );
        }

        // Handle images update if provided
        if (image_url && image_url.length > 0)
        {
            await connection.execute(
                'DELETE FROM slider_images WHERE slider_id = ?',
                [id]
            );

            await connection.query(
                `INSERT INTO slider_images (slider_id, image_url) VALUES (?, ?)`,
                [id, image_url]
            );
        }

        await connection.commit();
        connection.release();

        return this.findById(id);
    }

    static async delete(id)
    {
        const connection = await pool.getConnection();

        await connection.beginTransaction();

        await connection.execute(
            'DELETE FROM slider_images WHERE slider_id = ?',
            [id]
        );

        const [result] = await connection.execute(
            'DELETE FROM sliders WHERE id = ?',
            [id]
        );

        await connection.commit();
        connection.release();

        return result.affectedRows > 0;
    }

    static async getAll(options)
    {
        const baseUrl = process.env.APP_URL;

        const dataTableService = new DataTableService({
            baseQuery: `SELECT sl.id, sl.offer, sl.title, sl.subtitle, sl.description, sl.button_link, sl.status, u.name AS created_by, sl.created_at, GROUP_CONCAT(CONCAT('${baseUrl}/', si.image_url)) AS images FROM sliders sl`,
            joins: 'JOIN users u ON u.id = sl.created_by LEFT JOIN slider_images si ON sl.id = si.slider_id',
            searchColumns: ['sl.title', 'sl.subtitle', 'u.name'],
            defaultOrder: { column: 'sl.created_at', dir: 'desc' },
            groupBy: 'GROUP BY sl.id'
        });

        const {
            query,
            countQuery,
            queryParams,
            countParams,
            draw,
            page,
            limit
        } = await dataTableService.process(options);

        // Execute both queries in parallel
        const [data, countResult] = await Promise.all([
            this.executeQuery(query, queryParams),
            this.executeCountQuery(countQuery, countParams)
        ]);

        // Extract total and filtered counts
        const totalRecords = countResult[0].total;
        const filteredRecords = countResult[0].total;

        return {
            data,
            draw: parseInt(draw, 10),
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            page,
            limit
        };
    }

    static async executeQuery(query, params)
    {
        const [rows] = await pool.query(query, params);
        return rows.map(row => ({
            ...row,
            images: row.images ? row.images.split(',') : []
        }));
    }

    static async executeCountQuery(query, params)
    {
        const [result] = await pool.query(query, params);
        return result;
    }

}

module.exports = Slider;
