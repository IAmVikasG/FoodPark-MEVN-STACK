const pool = require('../config/database');

class RefreshToken
{
    static async deleteAllForUser(userId)
    {
        const [result] = await pool.execute(
            'DELETE FROM refresh_tokens WHERE user_id = ?',
            [userId]
        );

        return result.affectedRows;
    }

    static async delete(token)
    {
        const [result] = await pool.execute(
            'DELETE FROM refresh_tokens WHERE token = ?',
            [token]
        );

        return result.affectedRows;
    }
    
    static async create(data)
    {
        const { user_id, token, expires_at } = data;

        const [result] = await pool.execute(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user_id, token, expires_at]
        );

        return this.findById(result.insertId);
    }

    static async findValidToken(token)
    {
        const [result] = await pool.execute(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > ?',
            [token, new Date()]
        );

        return result[0];
    }

    static async update(id, data)
    {
        const { token, expires_at } = data;

        const [result] = await pool.execute(
            'UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE id = ?',
            [token, expires_at, id]
        );

        return this.findById(id);
    }

    static async delete(token)
    {
        const [result] = await pool.execute(
            'DELETE FROM refresh_tokens WHERE token = ?',
            [token]
        );

        return result.affectedRows;
    }

    static async findById(id)
    {
        const [result] = await pool.execute(
            'SELECT * FROM refresh_tokens WHERE id = ?',
            [id]
        );

        return result[0];
    }
}

module.exports = RefreshToken;
