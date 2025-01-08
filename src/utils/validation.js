const Joi = require('joi');

const authValidation = {
    register: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        confirmPassword: Joi.ref('password')
    }).with('password', 'confirmPassword'),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).max(100).required()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        confirmPassword: Joi.ref('password')
    }).with('password', 'confirmPassword')
};

module.exports = { authValidation };
