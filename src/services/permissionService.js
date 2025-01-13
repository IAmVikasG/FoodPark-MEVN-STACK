const Permission = require("../models/Permission");
const CustomError = require("../utils/customError");
const logger = require("../utils/logger");

class PermissionService
{
    static async index()
    {
        try
        {
            return await Permission.get();
        } catch (error)
        {
            logger.error("Error fetching permissions:", error);
            throw new CustomError("Unable to fetch permissions", 500);
        }
    }

    static async create(data)
    {
        try
        {
            const { name, description } = data;
            return await Permission.create({ name, description });
        } catch (error)
        {
            logger.error("Error creating permission:", error);
            throw new CustomError("Error creating permission", 500);
        }
    }

    static async update(id, data)
    {
        try
        {
            const permission = await Permission.findById(id);
            if (!permission)
            {
                throw new CustomError("Permission not found", 404);
            }

            await Permission.update(id, data);
            return await Permission.findById(id); // Return updated permission
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
