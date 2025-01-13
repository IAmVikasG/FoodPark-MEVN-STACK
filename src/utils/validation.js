const Joi = require('joi');

const imageValidation = Joi.any().custom((file, helpers) =>
{
    if (!file)
    {
        return helpers.message('Image file is required.');
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype))
    {
        return helpers.message('Only .jpeg, .png, and .gif files are allowed.');
    }
    if (file.size > 5 * 1024 * 1024)
    { // 5MB size limit
        return helpers.message('Image size must not exceed 5MB.');
    }
    return file; // Pass validation
});

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

const sliderValidation = {
    create: Joi.object({
        offer: Joi.string().min(1).required(),
        title: Joi.string().min(3).max(100).required(),
        subtitle: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).max(500).optional(),
        button_link: Joi.string().uri().optional(),
        status: Joi.string().required(),
    }),

    update: Joi.object({
        offer: Joi.string().min(1).required(),
        title: Joi.string().min(3).max(100).optional(),
        subtitle: Joi.string().min(3).max(100).optional(),
        description: Joi.string().min(10).max(500).optional(),
        button_link: Joi.string().uri().optional(),
        status: Joi.string().optional(),
    })
};

const roleValidation = {
    create: Joi.object({
        name: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).max(500).optional(),
    }),

    update: Joi.object({
        name: Joi.string().min(3).max(100).optional(),
        description: Joi.string().min(10).max(500).optional(),
    })
};

module.exports = { authValidation, sliderValidation, roleValidation };
