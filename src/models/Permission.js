const pool = require("../config/database");

class Permission
{
    static async get()
    {
        const [rows] = await pool.execute("SELECT * FROM permissions");
        return rows;
    }

    static async create(data)
    {
        const { name, description = null } = data;
        const [permissionResult] = await pool.execute(
            "INSERT INTO permissions (name, description) VALUES (?, ?)",
            [name, description]
        );

        return this.findById(permissionResult.insertId); // Return the newly created permission

    }

    static async findById(id)
    {
        const [rows] = await pool.execute(
            "SELECT * FROM permissions WHERE id = ?",
            [id]
        );
        return rows[0] || null; // Return null if no permission found
    }

    static async findByName(name)
    {
        const [rows] = await pool.execute(
            "SELECT * FROM permissions WHERE name = ?",
            [name]
        );
        return rows[0] || null;
    }

    static async update(id, data)
    {
        const { name, description = null } = data;
        await pool.execute(
            "UPDATE permissions SET name = ?, description = ? WHERE id = ?",
            [name, description, id]
        );
        return this.findById(id);
    }

    static async delete(id)
    {
        await pool.execute("DELETE FROM permissions WHERE id = ?", [id]);
    }
}

module.exports = Permission;
