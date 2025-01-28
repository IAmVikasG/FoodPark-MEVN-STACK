class PaginationHelper
{
    /**
     * @param {object} options - Options for pagination and filtering
     * @param {number} options.page - Current page number (default: 1)
     * @param {number} options.perPage - Results per page (default: 10)
     * @param {string} options.searchQuery - Search keyword (optional)
     * @param {object} options.filters - Filters for the query (key-value pairs)
     * @param {string} options.orderBy - Column to order by
     * @param {string} options.orderDirection - Order direction (asc/desc, default: asc)
     */
    constructor(options = {})
    {
        this.page = parseInt(options.page) || 1;
        this.perPage = parseInt(options.perPage) || 10;
        this.searchQuery = options.searchQuery || null;
        this.filters = options.filters || {};
        this.orderBy = options.orderBy || 'id';
        this.orderDirection = options.orderDirection === 'desc' ? 'DESC' : 'ASC';
    }

    /**
     * Get LIMIT and OFFSET values for SQL queries
     * @returns {string} SQL LIMIT and OFFSET string
     */
    getLimitOffset()
    {
        const offset = (this.page - 1) * this.perPage;
        return `LIMIT ${this.perPage} OFFSET ${offset}`;
    }

    /**
     * Generate WHERE clause for search and filters
     * @param {Array<string>} searchableColumns - Columns to search on
     * @returns {string} SQL WHERE clause
     */
    getWhereClause(searchableColumns = [])
    {
        const conditions = [];
        const params = [];

        // Add search condition
        if (this.searchQuery && searchableColumns.length)
        {
            const searchCondition = searchableColumns
                .map(column => `${column} LIKE ?`)
                .join(' OR ');
            conditions.push(`(${searchCondition})`);
            params.push(...searchableColumns.map(() => `%${this.searchQuery}%`));
        }

        // Add filters
        for (const [key, value] of Object.entries(this.filters))
        {
            conditions.push(`${key} = ?`);
            params.push(value);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        return { whereClause, params };
    }

    /**
     * Generate ORDER BY clause
     * @returns {string} SQL ORDER BY clause
     */
    getOrderByClause()
    {
        return `ORDER BY ${this.orderBy} ${this.orderDirection}`;
    }

    /**
     * Format the paginated response
     * @param {Array} data - Data for the current page
     * @param {number} total - Total number of records
     * @returns {object} Paginated response
     */
    formatResponse(data, total)
    {
        const totalPages = Math.ceil(total / this.perPage);
        return {
            currentPage: this.page,
            perPage: this.perPage,
            totalRecords: total,
            totalPages,
            data,
        };
    }
}

module.exports = PaginationHelper;
