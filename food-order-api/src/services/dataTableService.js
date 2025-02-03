class DataTableService
{
    constructor({
        baseQuery,
        joins = [],
        searchColumns = [],
        defaultOrder = { column: 'id', dir: 'asc' },
    })
    {
        this.baseQuery = baseQuery;
        this.joins = joins;
        this.searchColumns = searchColumns;
        this.defaultOrder = defaultOrder;
    }

    async process(requestParams)
    {
        const {
            draw = 1,
            start = 0,
            length = 10,
            order = [],
            search = { value: '' },
        } = requestParams;

        let query = `${this.baseQuery} WHERE 1=1`; // Using 1=1 ensures that additional conditions can be appended with consistent syntax
        let countQuery = `SELECT COUNT(*) as total FROM (${this.baseQuery}) AS derived_table WHERE 1=1`;
        const params = [];
        const countParams = [];

        // Add joins
        if (this.joins.length > 0)
        {
            query += ' ' + this.joins.join(' ');
        }

        // Handle search
        if (search.value && this.searchColumns.length > 0)
        {
            const searchCondition = this.searchColumns
                .map((col) => `${col} LIKE ?`)
                .join(' OR ');

            // Append search conditions
            query += ` AND (${searchCondition})`;
            countQuery += ` AND (${searchCondition})`;

            const searchParam = `%${search.value}%`;
            params.push(...Array(this.searchColumns.length).fill(searchParam));
            countParams.push(...Array(this.searchColumns.length).fill(searchParam));
        }

        // Handle sorting
        if (order.length > 0 && order[0]?.column !== undefined)
        {
            query += ` ORDER BY ${order[0].column} ${order[0].dir}`; // Use the order property
        }
        else
        {
            query += ` ORDER BY ${this.defaultOrder.column} ${this.defaultOrder.dir}`;
        }

        // Handle pagination
        query += ` LIMIT ?, ?`;
        params.push(parseInt(start, 10), parseInt(length, 10));

        return {
            query,
            countQuery,
            queryParams: params,
            countParams: countParams,
            draw,
            order, // Return the order property
            page: Math.ceil(parseInt(start, 10) / parseInt(length, 10)) + 1,
            limit: parseInt(length, 10),
        };
    }
}

module.exports = DataTableService;
