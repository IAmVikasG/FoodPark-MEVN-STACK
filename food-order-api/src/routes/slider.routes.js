const express = require('express');
const SliderController = require('../controllers/sliderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',
    SliderController.index
);

router.post('/create',
    authenticate, // Authenticate user
    authorize('admin'), // Check if the user has correct role with their permissions
    SliderController.store
);

router.put('/edit/:id',
    authenticate,
    authorize('admin'),// Check for 'edit' permission
    SliderController.update
);

router.delete('/delete/:id',
    authenticate,
    authorize('admin'), // Check for 'delete' permission
    SliderController.delete
);

module.exports = router;
