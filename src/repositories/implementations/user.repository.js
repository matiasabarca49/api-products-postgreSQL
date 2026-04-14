const pool = require('../../config/pg.config.js');

class UsersRepository{

    constructor() {
        this.pool = pool
    }

    //Para tienda: JOIN con categorías, filtros dinámicos, paginación y conteo total
    async findAll(filters = {}, limit = 10, page = 1, sort = 1) {
        const offset = (page - 1) * limit

        let name;
        let last_name;
        let email;

        if(filters.name){
            name = filters.name;
            delete filters.name;
        }

        if(filters.last_name){
            last_name = filters.last_name;
            delete filters.last_name;
        }

        if(filters.email){
            email = filters.email;
            delete filters.email;
        }
        
        const filterKeys   = Object.keys(filters)
        const filterValues = Object.values(filters)

        // WHERE para la query de datos: los filtros arrancan en $3 (después de limit y offset)
        let dataWhere = filterKeys.length > 0
            ? 'WHERE ' + filterKeys.map((key, i) => `${key} = $${i + 3}`).join(' AND ')
            : ''

        // WHERE para el COUNT: los filtros arrancan en $1 (no hay limit ni offset antes)
        let countWhere = filterKeys.length > 0
            ? 'WHERE ' + filterKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')
            : ''

        if(name){
            dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}name ILIKE $${filterKeys.length + 3}`; 
            countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}name ILIKE $${filterKeys.length + 1}`
            filterKeys.push("name");
            filterValues.push(`%${name}%`);
        }

        if(last_name){
            dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}last_name ILIKE $${filterKeys.length + 3}`; 
            countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}last_name ILIKE $${filterKeys.length + 1}`
            filterKeys.push("last_name");
            filterValues.push(`%${last_name}%`);
        }

        if(email){
            dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}email ILIKE $${filterKeys.length + 3}`; 
            countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}email ILIKE $${filterKeys.length + 1}`
            filterKeys.push("email");
            filterValues.push(`%${email}%`);
        }

        const [dataResult, countResult] = await Promise.all([
            this.pool.query(
                `SELECT * 
                FROM users
                ${dataWhere}
                ORDER BY ${sort && sort? `last_name ${sort > 0 ? 'ASC' : 'DESC'}` : 'id ASC'}
                LIMIT $1 OFFSET $2
                `,
                [limit, offset, ...filterValues]
            ),
            this.pool.query(
                `SELECT COUNT(*) FROM users ${countWhere}`,
                filterValues
            )
        ])
        const totalDocs  = parseInt(countResult.rows[0].count)
        const totalPages = Math.ceil(totalDocs / limit)

        return {
            docs: dataResult.rows,
            totalDocs,
            totalPages,
            page,
            limit,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        }
    }

     //Para tienda: JOIN con categorías, filtros dinámicos, paginación y conteo total
    async findAllAdmin(filters = {}, limit = 10, page = 1, sort = 1) {
        const offset = (page - 1) * limit

        let title;

        if(filters.title){
            title = filters.title;
            delete filters.title;
        }
        
        const filterKeys   = Object.keys(filters)
        const filterValues = Object.values(filters)

        // WHERE para la query de datos: los filtros arrancan en $3 (después de limit y offset)
        let dataWhere = filterKeys.length > 0
            ? 'WHERE ' + filterKeys.map((key, i) => `p.${key} = $${i + 3}`).join(' AND ')
            : ''

        // WHERE para el COUNT: los filtros arrancan en $1 (no hay limit ni offset antes)
        let countWhere = filterKeys.length > 0
            ? 'WHERE ' + filterKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')
            : ''


        if(title){
            dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}p.title ILIKE $${filterKeys.length + 3}`; 
            countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}title ILIKE $${filterKeys.length + 1}`
            filterKeys.push("title");
            filterValues.push(`%${title}%`);
        }

        const [dataResult, countResult] = await Promise.all([
            this.pool.query(
                `SELECT p.*, c.name AS category
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                ${dataWhere}
                ORDER BY ${sort && sort? `price ${sort > 0 ? 'ASC' : 'DESC'}` : 'id ASC'}
                LIMIT $1 OFFSET $2`,
                [limit, offset, ...filterValues]
            ),
            this.pool.query(
                `SELECT COUNT(*) FROM products ${countWhere}`,
                filterValues
            )
        ])

        const totalDocs  = parseInt(countResult.rows[0].count)
        const totalPages = Math.ceil(totalDocs / limit)

        return {
            docs: dataResult.rows,
            totalDocs,
            totalPages,
            page,
            limit,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        }
    }

    // findByID también con JOIN
    async findById(id) {
        const result = await this.pool.query(
            `SELECT * FROM users 
             WHERE id = $1`,
            [id]
        )
        return result.rows[0] ?? null
    }

    async existByID(id) {
        const result = await this.pool.query(
            `SELECT 1 FROM users WHERE id = $1`,
            [id]
        )
        return result.rowCount > 0
    }

    async findUserByEmail(email) {
        const result = await this.pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        )
        return result.rows[0] ?? null
    }

    async findCategoryByName(categoryName) {
        const result = await this.pool.query(
            `SELECT id FROM categories WHERE name = $1`,
            [categoryName]
        )
        return result.rows[0]?.id ?? null
    }


    async create(data) {
        const keys   = Object.keys(data)
        const values = Object.values(data)

        // Genera: ($1, $2, $3, ...)
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
        const columns      = keys.join(', ')

        const result = await this.pool.query(
            `INSERT INTO users (${columns})
             VALUES (${placeholders})
             RETURNING *`,
            values
        )
        return result.rows[0]
    }

    async update(id, data) {
        const keys   = Object.keys(data)
        const values = Object.values(data)

        // Genera: title = $1, price = $2, ...
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')

        const result = await this.pool.query(
            `UPDATE users
             SET ${setClause}
             WHERE id = $${keys.length + 1}
             RETURNING *`,
            [...values, id]
        )

        console.log("Resultado del update: ", result.rows[0]);

        return result.rows[0] ?? null
    }

    async updateLastConnection(userId) {
        await this.pool.query(
            `UPDATE users SET last_connection = NOW() WHERE id = $1`,
            [userId]
        );
    }

    async delete(id) {
        const result = await this.pool.query(
            `DELETE FROM products
             WHERE id = $1
             RETURNING *`,
            [id]
        )
        return result.rows[0] ?? null
    }

}

module.exports = UsersRepository;