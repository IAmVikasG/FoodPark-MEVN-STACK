const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EmailService = require('./emailService');
const CustomError = require('../utils/customError');
const logger = require('../utils/logger');
const { verifyRefreshToken, generateTokens, storeRefreshToken, revokeToken, decodeToken, revokeAllTokens, verifyAccessToken } = require('../helpers/tokenHelper');
const { comparePassword } = require('../helpers/authHelper');

class AuthService
{
    static async login(email, password)
    {
        const user = await User.findByEmail(email);
        if (!user) throw CustomError.notFound('User not found');

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) throw CustomError.badRequest('Invalid password');
        const { accessToken, refreshToken } = generateTokens(user);
        await storeRefreshToken(user.id, refreshToken)

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

    static async refreshToken(refreshToken, accessToken)
    {
        try
        {
            const decoded = await verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId);
            if (!user) throw CustomError.notFound('User not found');
            const tokens = generateTokens(user);
            await revokeToken(accessToken, 'refresh');
            await revokeToken(refreshToken, 'refresh');
            await storeRefreshToken(decoded.userId, tokens.refreshToken);

            return tokens;
        } catch (error)
        {
            throw CustomError.badRequest('Invalid refresh token');
        }
    }

    static async logout(accessToken, refreshToken)
    {
        await revokeToken(accessToken);
        if (refreshToken.length > 0) await revokeToken(refreshToken);
    }

    static async logoutAll(accessToken, refreshToken, userId)
    {
        if (refreshToken) await verifyRefreshToken(refreshToken);
        const accessTokenDecoded = decodeToken(accessToken);
        const refreshTokenDecoded = decodeToken(refreshToken);
        if (accessTokenDecoded.userId != userId || refreshTokenDecoded.userId != userId) throw CustomError.forbidden();
        this.logout(accessToken, refreshToken)
        await revokeAllTokens(userId);
    }

    static async register(userData)
    {
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) throw CustomError.conflict('Email already registered');

        try
        {
            const user = await User.create(userData);
            const token = generateTokens(user);

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
        if (!user) throw CustomError.notFound('User not found');
        return user;
    }
}

module.exports = AuthService;
