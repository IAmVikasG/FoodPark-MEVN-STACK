class HierarchyHelper
{
    /**
     * Recursively fetch all child records for a given parent ID.
     * @param {number} parentId - The parent ID to fetch children for.
     * @param {Function} fetchChildren - A callback function to fetch children from the database.
     * @returns {Promise<Array>} - A list of all child records.
     */
    static async getAllChildren(parentId, fetchChildren)
    {
        const children = await fetchChildren(parentId);
        if (!children.length)
        {
            return [];
        }

        const allChildren = [];
        for (const child of children)
        {
            const childChildren = await this.getAllChildren(child.id, fetchChildren);
            allChildren.push(child, ...childChildren);
        }

        return allChildren;
    }

    /**
     * Recursively fetch all parent records up the hierarchy for a given child ID.
     * @param {number} childId - The child ID to fetch parents for.
     * @param {Function} fetchParent - A callback function to fetch the immediate parent from the database.
     * @returns {Promise<Array>} - A list of all parent records.
     */
    static async getAllParents(childId, fetchParent)
    {
        const parent = await fetchParent(childId);
        if (!parent)
        {
            return [];
        }

        const parentParents = await this.getAllParents(parent.id, fetchParent);
        return [parent, ...parentParents];
    }
}
