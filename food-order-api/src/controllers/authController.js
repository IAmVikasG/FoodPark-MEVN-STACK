const asyncHandler = require('express-async-handler');
const AuthService = require('../services/authService');
const ResponseFormatter = require('../utils/responseFormatter');

class AuthController
{
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
        const { user, token } = await AuthService.login(email, password);
        return ResponseFormatter.success(
            res,
            { user, token },
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
}

module.exports = AuthController;
