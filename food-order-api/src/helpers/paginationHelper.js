class PaginationHelper
{
    /**
     * Helps create pagination for data.
     *
     * @param {object} options - Settings for pagination.
     * @param {number} options.page - The current page number (starts from 1). Default is 1.
     * @param {number} options.perPage - Number of items shown per page. Default is 10.
     * @param {string} options.searchQuery - Text to search for (optional).
     * @param {object} options.filters - Key-value pairs to filter data (optional).
     * @param {string} options.orderBy - The column to sort by. Default is 'id'.
     * @param {string} options.orderDirection - Sorting order ('asc' or 'desc'). Default is 'asc'.
     */
    constructor(options = {})
    {
        // Use provided values or defaults
        this.page = parseInt(options.page) || 1;       // Current page number
        this.perPage = parseInt(options.perPage) || 10;  // Items per page
        this.searchQuery = options.searchQuery || null; // Search term
        this.filters = options.filters || {};         // Filters
        this.orderBy = options.orderBy || 'id';        // Sort column
        this.orderDirection = options.orderDirection === 'desc' ? 'DESC' : 'ASC'; // Sort direction
    }

    /**
     * Creates the LIMIT and OFFSET part for a database query.
     * This tells the database which items to fetch for the current page.
     *
     * @returns {string} The LIMIT and OFFSET string for SQL.
     */
    getLimitOffset()
    {
        const offset = (this.page - 1) * this.perPage; // Calculate how many items to skip
        return `LIMIT ${this.perPage} OFFSET ${offset}`; // Build the SQL string
    }

    /**
     * Creates the WHERE clause for a database query, including search and filters.
     * This tells the database which items to include based on search and filter criteria.
     *
     * @param {Array<string>} searchableColumns - The columns to search in.
     * @returns {object} An object containing the WHERE clause string and an array of parameters.
     */
    getWhereClause(searchableColumns = [])
    {
        const conditions = []; // Array to hold the individual conditions
        const params = [];     // Array to hold the values for the conditions (prevents SQL injection)

        // Add search condition if there's a search query and columns to search in
        if (this.searchQuery && searchableColumns.length)
        {
            const searchCondition = searchableColumns
                .map(column => `${column} LIKE ?`) // Create "column LIKE ?" for each searchable column
                .join(' OR '); // Combine with OR (search in any of the columns)

            conditions.push(`(${searchCondition})`); // Add the search condition to the array
            params.push(...searchableColumns.map(() => `%${this.searchQuery}%`)); // Add the search value with wildcards
        }

        // Add filter conditions
        for (const [key, value] of Object.entries(this.filters))
        {
            conditions.push(`${key} = ?`); // Create "key = ?" for each filter
            params.push(value);         // Add the filter value to the array
        }

        // Combine all conditions with AND
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        return { whereClause, params }; // Return the WHERE clause and the parameters
    }

    /**
     * Creates the ORDER BY clause for a database query.
     * This tells the database how to sort the results.
     *
     * @returns {string} The ORDER BY string for SQL.
     */
    getOrderByClause()
    {
        return `ORDER BY ${this.orderBy} ${this.orderDirection}`;
    }

    /**
     * Formats the data for the current page into a nice object.
     * Includes information about the current page, total pages, etc.
     *
     * @param {Array} data - The data for the current page.
     * @param {number} total - The total number of items (across all pages).
     * @returns {object} The formatted response object.
     */
    formatResponse(data, total)
    {
        const totalPages = Math.ceil(total / this.perPage); // Calculate the total number of pages

        return {
            currentPage: this.page,       // Current page number
            perPage: this.perPage,       // Items per page
            totalRecords: total,       // Total number of items
            totalPages: totalPages,       // Total number of pages
            data: data,                 // The data for the current page
        };
    }
}

module.exports = PaginationHelper; // Make the class available for use in other files
