const express = require('express');
const CategoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');


const router = express.Router();

router.get('/',
    authenticate,
    authorize('admin'),
    CategoryController.index
);

router.post('/',
    authenticate,
    authorize('admin'),
    CategoryController.store
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    CategoryController.update
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    CategoryController.delete
);


module.exports = router;
