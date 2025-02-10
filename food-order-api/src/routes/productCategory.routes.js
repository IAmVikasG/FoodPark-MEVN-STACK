const express = require('express');
const ProductCategoryController = require('../controllers/productCategoryController');
const { authenticate, authorize } = require('../middleware/auth');


const router = express.Router();

router.get('/',
    authenticate,
    authorize('admin'),
    ProductCategoryController.index
);

router.post('/',
    authenticate,
    authorize('admin'),
    ProductCategoryController.store
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    ProductCategoryController.update
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    ProductCategoryController.delete
);

router.get('/only-parents',
    authenticate,
    authorize('admin'),
    ProductCategoryController.getParentProductCategory
);


module.exports = router;
