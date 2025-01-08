const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User
{
    static async findByEmail(email)
    {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id)
    {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(userData)
    {
        const { name, email, password, role = 'user' } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        return this.findById(result.insertId);
    }

    static async updatePassword(userId, newPassword)
    {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );
    }
}

module.exports = User;
