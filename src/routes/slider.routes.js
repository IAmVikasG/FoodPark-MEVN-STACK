const express = require('express');
const SliderController = require('../controllers/sliderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',
    authenticate,
    SliderController.index
);

router.post('/create',
    authenticate, // Authenticate user
    authorize(['admin', 'customer']), // Check if the user has correct role with their permissions
    SliderController.store
);

router.put('/edit/:id',
    authenticate,
    authorize(['admin', 'customer']),// Check for 'edit' permission
    SliderController.update
);

router.delete('/delete/:id',
    authenticate,
    authorize(['admin', 'customer']), // Check for 'delete' permission
    SliderController.delete
);

module.exports = router;
