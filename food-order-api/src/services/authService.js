const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const EmailService = require('./emailService');
const CustomError = require('../utils/customError');
const logger = require('../utils/logger');

class AuthService
{
    static generateToken(user)
    {
        return jwt.sign(
            { id: user.id, email: user.email, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    }

    static async register(userData)
    {
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser)
        {
            throw CustomError.badRequest('Email already registered');
        }

        try
        {
            const user = await User.create(userData);
            const token = this.generateToken(user);

            // Send welcome email
            await EmailService.sendWelcomeEmail(user.email, user.name);

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles,
                    created_at: user.created_at
                },
                token
            };
        } catch (error)
        {
            logger.error('Registration error:', error);
            throw CustomError.internal('Error during registration');
        }
    }

    static async login(email, password)
    {
        const user = await User.findByEmail(email);
        if (!user)
        {
            throw CustomError.unauthorized('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
        {
            throw CustomError.unauthorized('Invalid credentials');
        }

        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                created_at: user.created_at
            },
            token
        };
    }

    static async forgotPassword(email)
    {
        const user = await User.findByEmail(email);
        if (!user)
        {
            // Don't reveal whether email exists
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Use model method to update the reset token
        await User.storeResetToken(user.id, resetTokenHash);

        await EmailService.sendPasswordResetEmail(
            user.email,
            `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        );
    }

    static async resetPassword(token, newPassword)
    {
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findByResetToken(resetTokenHash);

        if (!user || user.reset_token_expires < new Date())
        {
            throw new CustomError.badRequest('Invalid or expired reset token');
        }

        await User.updatePassword(user.id, newPassword);

        await User.clearResetToken(user.id);
    }

    static async getProfile(userId)
    {
        const user = User.findById(userId);
        if (!user) throw new CustomError('User not found', 401);
        return user;
    }
}

module.exports = AuthService;
