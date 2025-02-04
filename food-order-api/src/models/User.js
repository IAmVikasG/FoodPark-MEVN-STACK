const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const Role = require('./Role');
const { hashPassword } = require('../helpers/authHelper');

class User
{
    static async storeResetToken(userId, resetTokenHash)
    {
        await pool.execute(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [resetTokenHash, new Date(Date.now() + 3600000), userId]
        );
    }

    static async findByResetToken(resetTokenHash)
    {
        const [rows] = await pool.execute(
            'SELECT id, reset_token_expires FROM users WHERE reset_token = ?',
            [resetTokenHash]
        );

        return rows[0] || null;
    }

    static async clearResetToken(userId)
    {
        await pool.execute(
            'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [userId]
        );
    }

    static async findByEmail(email)
    {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!users.length) return null;

        const user = users[0];
        const roles = await Role.getUserRoles(user.id);

        return {
            ...user,
            roles: roles.map(role => role.role_name)
        };
    }

    static async findById(id)
    {
        const [users] = await pool.execute(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [id]
        );

        if (!users.length) return null;

        const user = users[0];
        const roles = await Role.getUserRoles(user.id);

        return {
            ...user,
            roles: roles.map(role => role.role_name)
        };
    }

    static async create(userData)
    {
        const { name, email, password } = userData;
        const hashedPassword = await hashPassword(password, 12);

        // Insert user
        const [userResult] = await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const userId = userResult.insertId;

        // Get and assign default role using Role model
        const defaultRole = await Role.getDefaultCustomerRole();
        await Role.assignUserRole(userId, defaultRole.id);

        // Fetch the created user
        return this.findById(userId);

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
