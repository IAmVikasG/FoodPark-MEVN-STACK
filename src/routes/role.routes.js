const express = require('express');
const RoleController = require('../controllers/roleController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',
    authenticate,
    authorize('admin'),
    RoleController.index
);

router.post('/',
    authenticate, // Authenticate user
    authorize('admin'), // Check if the user has correct role with their permissions
    RoleController.store
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    RoleController.update
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    RoleController.delete
);

module.exports = router;
