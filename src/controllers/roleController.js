const asyncHandler = require('express-async-handler');
const RoleService = require('../services/roleService');
const ResponseFormatter = require('../utils/responseFormatter');
const { roleValidation } = require('../utils/validation');
const validateRequest = require('../middleware/requestValidator');

class RoleController
{
    /**
     * Fetch all roles
     */
    static index = asyncHandler(async (req, res) =>
    {
        const roles = await RoleService.index();
        return ResponseFormatter.success(
            res,
            roles,
            'Roles retrieved successfully',
            200
        );
    });

    /**
     * Create a new role
     */
    static store = asyncHandler(async (req, res) =>
    {
        const validation = await validateRequest.validate(roleValidation.create, req, res);
        if (!validation.isValid) return;

        const role = await RoleService.create(req.body);
        return ResponseFormatter.success(
            res,
            role,
            'Role created successfully',
            201
        );
    });

    /**
     * Update an existing role
     */
    static update = asyncHandler(async (req, res) =>
    {
        const { id } = req.params;
        const validation = await validateRequest.validate(roleValidation.update, req, res);
        if (!validation.isValid) return;

        const role = await RoleService.update(id, req.body);
        return ResponseFormatter.success(
            res,
            role,
            'Role updated successfully',
            200
        );
    });

    /**
     * Delete a role
     */
    static delete = asyncHandler(async (req, res) =>
    {
        const { id } = req.params;

        await RoleService.delete(id);
        return ResponseFormatter.success(
            res,
            null,
            'Role deleted successfully',
            200
        );
    });
}

module.exports = RoleController;
