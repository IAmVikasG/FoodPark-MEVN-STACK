const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const EmailService = require('./emailService');
const CustomError = require('../utils/customError');
const logger = require('../utils/logger');

class AuthService
{
    static generateTokens(user)
    {
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );

        return { accessToken, refreshToken };
    }

    static async login(email, password)
    {
        const user = await User.findByEmail(email);
        if (!user)
        {
            throw CustomError.notFound('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
        {
            throw CustomError.badRequest('Invalid password');
        }

        const { accessToken, refreshToken } = this.generateTokens(user);

        // Store refresh token in database
        await RefreshToken.create({
            user_id: user.id,
            token: refreshToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                created_at: user.created_at
            },
            accessToken,
            refreshToken
        };
    }

    static async refreshToken(refreshToken)
    {
        try
        {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Check if token exists in database and is not expired
            const storedToken = await RefreshToken.findValidToken(refreshToken);
            if (!storedToken)
            {
                throw CustomError.badRequest('Invalid refresh token');
            }

            const user = await User.findById(decoded.id);
            if (!user)
            {
                throw CustomError.notFound('User not found');
            }

            // Generate new tokens
            const tokens = this.generateTokens(user);

            // Update refresh token in database
            await RefreshToken.update(storedToken.id, {
                token: tokens.refreshToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            return tokens;
        } catch (error)
        {
            throw CustomError.badRequest('Invalid refresh token');
        }
    }

    static async logout(refreshToken, userId)
    {
        const token = await RefreshToken.findValidToken(refreshToken);

        if (!token)
        {
            throw CustomError.badRequest('Invalid refresh token');
        }

        // Verify the token belongs to the user making the request
        if (token.user_id !== userId)
        {
            throw CustomError.forbidden('Forbidden');
        }

        await RefreshToken.delete(refreshToken);
    }

    static async logoutAll(userId)
    {
        await RefreshToken.deleteAllForUser(userId);
    }

    static async register(userData)
    {
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser)
        {
            throw CustomError.conflict('Email already registered');
        }

        try
        {
            const user = await User.create(userData);
            const token = this.generateTokens(user);

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
            throw CustomError.badRequest('Invalid or expired reset token');
        }

        await User.updatePassword(user.id, newPassword);

        await User.clearResetToken(user.id);
    }

    static async getProfile(userId)
    {
        const user = await User.findById(userId);
        if (!user)
        {
            throw CustomError.notFound('User not found');
        }
        return user;
    }
}

module.exports = AuthService;
