const asyncHandler = require('express-async-handler');
const AuthService = require('../services/authService');
const ResponseFormatter = require('../utils/responseFormatter');

class AuthController
{
    static refreshToken = asyncHandler(async (req, res) =>
    {
        const { refreshToken: requestedRefreshToken } = req.body;
        const { accessToken, refreshToken } = await AuthService.refreshToken(requestedRefreshToken);
        return ResponseFormatter.success(
            res,
            { access_token: accessToken, refresh_token: refreshToken },
            'Tokens refreshed successfully'
        );
    });

    static register = asyncHandler(async (req, res) =>
    {
        const { user, token } = await AuthService.register(req.body);
        return ResponseFormatter.success(
            res,
            { user, token },
            'Registration successful',
            201
        );
    });

    static login = asyncHandler(async (req, res) =>
    {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await AuthService.login(email, password);
        return ResponseFormatter.success(
            res,
            { user, accessToken, refreshToken },
            'Login successful'
        );
    });

    static forgotPassword = asyncHandler(async (req, res) =>
    {
        await AuthService.forgotPassword(req.body.email);
        return ResponseFormatter.success(
            res,
            null,
            'If your email is registered, you will receive a password reset link'
        );
    });

    static resetPassword = asyncHandler(async (req, res) =>
    {
        const { token, password } = req.body;
        await AuthService.resetPassword(token, password);
        return ResponseFormatter.success(
            res,
            null,
            'Password reset successful'
        );
    });

    static getProfile = asyncHandler(async (req, res) =>
    {
        const user = await AuthService.getProfile(req.userId);
        return ResponseFormatter.success(res, user);
    });

    static logout = asyncHandler(async (req, res) =>
    {
        const { refreshToken } = req.body;
        await AuthService.logout(refreshToken, req.userId);
        return ResponseFormatter.success(
            res,
            null,
            'Logged out successfully'
        );
    });

    static logoutAll = asyncHandler(async (req, res) =>
    {
        await AuthService.logoutAll(req.userId);
        return ResponseFormatter.success(
            res,
            null,
            'Logged out from all devices successfully'
        );
    });
}

module.exports = AuthController;
