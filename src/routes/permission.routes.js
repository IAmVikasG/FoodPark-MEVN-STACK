const express = require('express');
const PermissionController = require('../controllers/permissionController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',
    authenticate,
    authorize('admin'),
    PermissionController.index
);

router.post('/',
    authenticate, // Authenticate user
    authorize('admin'), // Check if the user has correct Permission with their permissions
    PermissionController.store
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    PermissionController.update
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    PermissionController.delete
);

module.exports = router;
