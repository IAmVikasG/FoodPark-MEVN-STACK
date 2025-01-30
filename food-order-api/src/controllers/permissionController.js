const asyncHandler = require('express-async-handler');
const PermissionService = require('../services/permissionService');
const ResponseFormatter = require('../utils/responseFormatter');
const { permissionValidation } = require('../utils/validation');
const validateRequest = require('../middleware/requestValidator');

class PermissionController
{
    /**
     * Fetch all permissions
     */
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

        const permissions = await PermissionService.index(options);

        return ResponseFormatter.success(
            res,
            permissions,
            'Permissions retrieved successfully',
            200
        );
    });

    /**
     * Create a new permission
     */
    static store = asyncHandler(async (req, res) =>
    {
        const validation = await validateRequest.validate(permissionValidation.create, req, res);
        if (!validation.isValid) return;

        const permission = await PermissionService.create(req.body);
        return ResponseFormatter.success(
            res,
            permission,
            'Permission created successfully',
            201
        );
    });

    /**
     * Update an existing permission
     */
    static update = asyncHandler(async (req, res) =>
    {
        const { id } = req.params;
        const validation = await validateRequest.validate(permissionValidation.update, req, res);
        if (!validation.isValid) return;

        const permission = await PermissionService.update(id, req.body);
        return ResponseFormatter.success(
            res,
            permission,
            'Permission updated successfully',
            200
        );
    });

    /**
     * Delete a permission
     */
    static delete = asyncHandler(async (req, res) =>
    {
        const { id } = req.params;

        await PermissionService.delete(id);
        return ResponseFormatter.success(
            res,
            null,
            'Permission deleted successfully',
            200
        );
    });
}

module.exports = PermissionController;
