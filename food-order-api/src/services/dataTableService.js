class DataTableService
{
    constructor({
        baseQuery,
        joins = '',
        searchColumns = [],
        defaultOrder = { column: 'id', dir: 'asc' },
        groupBy = '', // Added groupBy parameter
    })
    {
        this.baseQuery = baseQuery;
        this.joins = joins;
        this.searchColumns = searchColumns;
        this.defaultOrder = defaultOrder;
        this.groupBy = groupBy; // Store groupBy
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

        let query = `${this.baseQuery} ${this.joins} WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) as total FROM (${this.baseQuery} ${this.joins} WHERE 1=1) AS derived_table`; // Initial count query without conditions

        const params = [];
        const countParams = [];

        // Handle search
        if (search.value && this.searchColumns.length > 0)
        {
            const searchCondition = this.searchColumns
                .map((col) => `${col} LIKE ?`)
                .join(' OR ');

            query += ` AND (${searchCondition})`;
            // Update countQuery to include search conditions in the subquery
            countQuery = `SELECT COUNT(*) as total FROM (${this.baseQuery} ${this.joins} WHERE 1=1 AND (${searchCondition})) AS derived_table`;

            const searchParam = `%${search.value}%`;
            params.push(...Array(this.searchColumns.length).fill(searchParam));
            countParams.push(...Array(this.searchColumns.length).fill(searchParam));
        }

        // Add GROUP BY to main query
        if (this.groupBy)
        {
            query += ` ${this.groupBy}`;
            // Include GROUP BY in the count subquery to get accurate count of groups
            countQuery = `SELECT COUNT(*) as total FROM (${this.baseQuery} ${this.joins} WHERE 1=1 ${search.value ? `AND (${searchCondition})` : ''} ${this.groupBy}) AS filtered_groups`;
        }

        // Handle sorting
        if (order.length > 0 && order[0]?.column)
        {
            query += ` ORDER BY ${order[0].column} ${order[0].dir}`;
        } else
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
            page: Math.ceil(parseInt(start, 10) / parseInt(length, 10)) + 1,
            limit: parseInt(length, 10),
        };
    }
}

module.exports = DataTableService;
