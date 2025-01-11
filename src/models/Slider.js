const pool = require('../config/database');


class Slider
{
    static async create(data)
    {
        const connection = await pool.getConnection();
        try
        {
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

            // Insert images into slider_images table
            if (image_url && image_url.length > 0)
            {
                // Prepare image values for bulk insert
                // const imageValues = image_url.map(imageUrl => [sliderId, imageUrl]);

                await connection.query(
                    `INSERT INTO slider_images (slider_id, image_url) VALUES (?, ?)`,
                    [sliderId, image_url]
                );
            }

            await connection.commit();

            // Return created slider with its images
            return await this.findById(sliderId);

        } catch (error)
        {
            await connection.rollback();
            console.error('Error creating slider:', error);
            throw new Error('Unable to create slider.');
        } finally
        {
            connection.release();
        }
    }

    // Helper method to get slider with its images
    static async findById(id)
    {
        const connection = await pool.getConnection();
        try
        {
            const [rows] = await connection.execute(
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

            // Format the response
            return {
                ...rows[0],
                images: rows[0].images ? rows[0].images.split(',') : []
            };

        } catch (error)
        {
            console.error('Error fetching slider:', error);
            throw new Error('Unable to fetch slider.');
        } finally
        {
            connection.release();
        }
    }

    // Update method with image handling
    static async update(id, data)
    {
        const connection = await pool.getConnection();
        try
        {
            await connection.beginTransaction();

            const { image_url, ...sliderData } = data;
            // console.log(data); return;

            // Update slider basic info
            if (Object.keys(sliderData).length > 0)
            {
                const updateFields = Object.entries(sliderData)
                    .map(([key, _]) => `${key} = ?`)
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
                // First delete existing images
                await connection.execute(
                    'DELETE FROM slider_images WHERE slider_id = ?',
                    [id]
                );

                // Insert new images
                // const imageValues = image_url.map(imageUrl => [id, imageUrl]);
                await connection.query(
                    `INSERT INTO slider_images (slider_id, image_url) VALUES (?, ?)`,
                    [id, image_url]
                );
            }

            await connection.commit();

            // Return updated slider
            return await this.findById(id);

        } catch (error)
        {
            await connection.rollback();
            console.error('Error updating slider:', error);
            throw new Error('Unable to update slider.');
        } finally
        {
            connection.release();
        }
    }

    // Delete method with image cleanup
    static async delete(id)
    {
        const connection = await pool.getConnection();
        try
        {
            await connection.beginTransaction();

            // Delete images first (foreign key constraint)
            await connection.execute(
                'DELETE FROM slider_images WHERE slider_id = ?',
                [id]
            );

            // Delete slider
            const [result] = await connection.execute(
                'DELETE FROM sliders WHERE id = ?',
                [id]
            );

            await connection.commit();
            return result.affectedRows > 0;

        } catch (error)
        {
            await connection.rollback();
            console.error('Error deleting slider:', error);
            throw new Error('Unable to delete slider.');
        } finally
        {
            connection.release();
        }
    }

    // Get all sliders with images
    static async getAll()
    {
        const [sliders] = await pool.execute(
            `SELECT sl.id, sl.offer, sl.title, sl.subtitle, sl.description, sl.button_link,
            sl.status, u.name AS created_by, sl.created_at,
            GROUP_CONCAT(si.image_url) AS images
            FROM sliders sl
            JOIN users u ON u.id = sl.created_by
            LEFT JOIN slider_images si ON sl.id = si.slider_id
            GROUP BY sl.id`
        );

        return sliders.length ? sliders.map(slider => ({
            ...slider,
            images: slider.images ? slider.images.split(',') : []
        })) : [];
    }
}

module.exports = Slider;
