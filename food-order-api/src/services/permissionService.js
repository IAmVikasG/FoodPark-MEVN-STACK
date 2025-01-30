const Permission = require("../models/Permission");
const CustomError = require("../utils/customError");
const logger = require("../utils/logger");

class PermissionService
{
    static async index(options)
    {
        try
        {
            return await Permission.get(options);
        } catch (error)
        {
            logger.error("Error fetching permissions:", error);
            throw new CustomError("Unable to fetch permissions", 500);
        }
    }

    static async create(data)
    {
        const existingPermission = await Permission.findByName(data.name);
        if (existingPermission) throw CustomError.conflict(`Permission already exists`);

        try
        {
            return await Permission.create(data);
        } catch (error)
        {
            logger.error("Error creating permission:", error);
            throw new CustomError("Error creating permission", 500);
        }
    }

    static async update(id, data)
    {
        const permission = await Permission.findById(id);
        if (!permission) throw CustomError.notFound("Permission not found", 404);

        const existingPermission = await Permission.findByName(data.name);
        if (existingPermission && existingPermission.id !== id) throw CustomError.conflict(`Permission with name "${data.name}" already exists`);

        try
        {
            return await Permission.update(id, data);
        } catch (error)
        {
            logger.error("Error updating permission:", error);
            throw new CustomError("Error updating permission", 500);
        }
    }

    static async delete(id)
    {
        try
        {
            const permission = await Permission.findById(id);
            if (!permission)
            {
                throw new CustomError("Permission not found", 404);
            }

            await Permission.delete(id);
            return { message: "Permission deleted successfully" };
        } catch (error)
        {
            logger.error("Error deleting permission:", error);
            throw new CustomError("Error deleting permission", 500);
        }
    }
}

module.exports = PermissionService;
