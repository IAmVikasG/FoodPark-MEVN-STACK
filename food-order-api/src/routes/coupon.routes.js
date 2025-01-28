const express = require('express');
const CouponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',
    authenticate,
    authorize('admin'),
    CouponController.index
);

router.post('/',
    authenticate,
    authorize('admin'),
    CouponController.store
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    CouponController.update
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    CouponController.delete
);


module.exports = router;
