const pool = require("../config/database");
const logger = require("../utils/logger");

class Role
{
    static async get()
    {
        try
        {
            const [rows] = await pool.execute("SELECT * FROM roles");
            return rows;
        } catch (error)
        {
            logger.error("Error fetching roles from database:", error);
            throw error; // Pass the error to the service layer
        }
    }

    static async create(data)
    {
        try
        {
            const { name, description = null } = data;
            const [roleResult] = await pool.execute(
                "INSERT INTO roles (name, description) VALUES (?, ?)",
                [name, description]
            );

            return this.findById(roleResult.insertId); // Return the newly created role
        } catch (error)
        {
            logger.error("Error creating role in database:", error);
            throw error;
        }
    }

    static async findById(id)
    {
        try
        {
            const [rows] = await pool.execute(
                "SELECT * FROM roles WHERE id = ?",
                [id]
            );
            return rows[0] || null; // Return null if no role found
        } catch (error)
        {
            logger.error("Error fetching role by ID:", error);
            throw error;
        }
    }

    static async findByName(name)
    {
        try
        {
            const [rows] = await pool.execute(
                "SELECT * FROM roles WHERE name = ?",
                [name]
            );
            return rows[0] || null;
        } catch (error)
        {
            logger.error("Error fetching role by name:", error);
            throw error;
        }
    }

    static async assignUserRole(userId, roleId)
    {
        try
        {
            await pool.execute(
                "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
                [userId, roleId]
            );
        } catch (error)
        {
            logger.error("Error assigning user role:", error);
            throw error;
        }
    }

    static async getDefaultCustomerRole()
    {
        try
        {
            const [roles] = await pool.execute(
                "SELECT id FROM roles WHERE name = ?",
                ["customer"]
            );

            if (!roles.length)
            {
                throw new Error("Default customer role not found");
            }

            return roles[0];
        } catch (error)
        {
            logger.error("Error fetching default customer role:", error);
            throw error;
        }
    }

    static async getUserRoles(userId)
    {
        try
        {
            const [rows] = await pool.execute(
                `SELECT r.name as role_name
                 FROM roles r
                 JOIN user_roles ur ON r.id = ur.role_id
                 WHERE ur.user_id = ?`,
                [userId]
            );
            return rows;
        } catch (error)
        {
            logger.error("Error fetching user roles:", error);
            throw error;
        }
    }

    static async update(id, data)
    {
        try
        {
            const { name, description = null } = data;
            await pool.execute(
                "UPDATE roles SET name = ?, description = ? WHERE id = ?",
                [name, description, id]
            );
        } catch (error)
        {
            logger.error("Error updating role in database:", error);
            throw error;
        }
    }

    static async delete(id)
    {
        try
        {
            await pool.execute("DELETE FROM roles WHERE id = ?", [id]);
        } catch (error)
        {
            logger.error("Error deleting role from database:", error);
            throw error;
        }
    }
}

module.exports = Role;
