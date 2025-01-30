const asyncHandler = require('express-async-handler');
const CategoryService = require('../services/productCategoryService');
const ResponseFormatter = require('../utils/responseFormatter');
const { categoryValidation } = require('../utils/validation');
const validateRequest = require('../middleware/requestValidator');

class ProductCategoryController
{
    static index = asyncHandler(async (req, res) =>
    {
        const options = {
            page: req.query.page,
            perPage: req.query.perPage,
            searchQuery: req.query.search,
            sortKey: req.query.sortKey,
            sortDirection: req.query.sortDirection,
            filters: req.query.filters ? JSON.parse(req.query.filters) : {},
        };

        const categories = await CategoryService.getAllCategories(options);
        return ResponseFormatter.success(res, categories, 'Categories retrieved successfully');
    });

    static store = asyncHandler(async (req, res) =>
    {
        const validation = await validateRequest.validate(categoryValidation.create, req, res);
        if (!validation.isValid) return;

        const category = await CategoryService.create(req.body);
        return ResponseFormatter.success(
            res,
            category,
            'Category created successfully',
            201
        );
    });

    static update = asyncHandler(async (req, res) =>
    {
        const validation = await validateRequest.validate(categoryValidation.update, req, res);
        if (!validation.isValid) return;

        const category = await CategoryService.update(req.params.id, req.body);
        return ResponseFormatter.success(
            res,
            category,
            'Category updated successfully'
        );
    });

    static delete = asyncHandler(async (req, res) =>
    {
        await CategoryService.delete(req.params.id);
        return ResponseFormatter.success(
            res,
            null,
            'Category deleted successfully'
        );
    });
}

module.exports = ProductCategoryController;
