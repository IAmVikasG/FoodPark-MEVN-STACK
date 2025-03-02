const Role = require("../models/Role");
const CustomError = require("../utils/customError");
const logger = require("../utils/logger");

class RoleService
{
    static async index(options)
    {
        try
        {
            return await Role.get(options);
        } catch (error)
        {
            logger.error("Error fetching roles:", error);
            throw new CustomError("Unable to fetch roles", 500);
        }
    }

    static async create(data)
    {
        try
        {
            return await Role.create(data);
        } catch (error)
        {
            logger.error("Error creating role:", error);
            throw new CustomError("Error creating role", 500);
        }
    }

    static async update(id, data)
    {
        const role = await Role.findById(id);
        if (!role) throw CustomError.notFound("Role not found", 404);

        const existingRole = await Role.findByName(data.name);

        if (existingRole && existingRole.id != id) throw CustomError.conflict(`Role with name "${data.name}" already exists`);

        try
        {
            return await Role.update(id, data);
        } catch (error)
        {
            logger.error("Error updating role:", error);
            throw new CustomError("Error updating role", 500);
        }
    }

    static async delete(id)
    {
        try
        {
            const role = await Role.findById(id);
            if (!role)
            {
                throw new CustomError("Role not found", 404);
            }

            await Role.delete(id);
            return { message: "Role deleted successfully" };
        } catch (error)
        {
            logger.error("Error deleting role:", error);
            throw new CustomError("Error deleting role", 500);
        }
    }
}

module.exports = RoleService;
