const express = require('express');
const AuthController = require('../controllers/authController');
const validateRequest = require('../middleware/requestValidator');
const { authValidation } = require('../utils/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register',
    validateRequest(authValidation.register),
    AuthController.register
);

router.post('/login',
    validateRequest(authValidation.login),
    AuthController.login
);

router.post('/forgot-password',
    validateRequest(authValidation.forgotPassword),
    AuthController.forgotPassword
);

router.post('/reset-password',
    validateRequest(authValidation.resetPassword),
    AuthController.resetPassword
);

router.get('/profile',
    authenticate,
    AuthController.getProfile
);

module.exports = router;
