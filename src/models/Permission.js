const pool = require("../config/database");
const logger = require("../utils/logger");

class Permission
{
    static async get()
    {
        try
        {
            const [rows] = await pool.execute("SELECT * FROM permissions");
            return rows;
        } catch (error)
        {
            logger.error("Error fetching permissions from database:", error);
            throw error; // Pass the error to the service layer
        }
    }

    static async create(data)
    {
        try
        {
            const { name, description = null } = data;
            const [permissionResult] = await pool.execute(
                "INSERT INTO permissions (name, description) VALUES (?, ?)",
                [name, description]
            );

            return this.findById(permissionResult.insertId); // Return the newly created permission
        } catch (error)
        {
            logger.error("Error creating permission in database:", error);
            throw error;
        }
    }

    static async findById(id)
    {
        try
        {
            const [rows] = await pool.execute(
                "SELECT * FROM permissions WHERE id = ?",
                [id]
            );
            return rows[0] || null; // Return null if no permission found
        } catch (error)
        {
            logger.error("Error fetching permission by ID:", error);
            throw error;
        }
    }

    static async findByName(name)
    {
        try
        {
            const [rows] = await pool.execute(
                "SELECT * FROM permissions WHERE name = ?",
                [name]
            );
            return rows[0] || null;
        } catch (error)
        {
            logger.error("Error fetching permission by name:", error);
            throw error;
        }
    }

    static async update(id, data)
    {
        try
        {
            const { name, description = null } = data;
            await pool.execute(
                "UPDATE permissions SET name = ?, description = ? WHERE id = ?",
                [name, description, id]
            );
        } catch (error)
        {
            logger.error("Error updating permission in database:", error);
            throw error;
        }
    }

    static async delete(id)
    {
        try
        {
            await pool.execute("DELETE FROM permissions WHERE id = ?", [id]);
        } catch (error)
        {
            logger.error("Error deleting permission from database:", error);
            throw error;
        }
    }
}

module.exports = Permission;
