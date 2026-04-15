const { filter } = require('express-compression');
const pool = require('../../config/pg.config.js');

class ProductsRepository{

    constructor() {
        this.pool = pool
    }

    //Para tienda: JOIN con categorías, filtros dinámicos, paginación y conteo total
    async findAll(filters = {}, limit = 10, page = 1, sort = 1) {
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
            dataWhere += ` AND p.title ILIKE $${filterKeys.length + 3}`; 
            countWhere += ` AND title ILIKE $${filterKeys.length + 1}`
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
                LIMIT $1 OFFSET $2
                `,
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
    async findByID(id) {
        const result = await this.pool.query(
            `SELECT 
                p.*,
                c.name AS category
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = $1`,
            [id]
        )
        return result.rows[0] ?? null
    }

    async existByID(id) {
        const result = await this.pool.query(
            `SELECT 1 FROM products WHERE id = $1`,
            [id]
        )
        return result.rowCount > 0
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
            `INSERT INTO products (${columns})
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
            `UPDATE products
             SET ${setClause}
             WHERE id = $${keys.length + 1}
             RETURNING *`,
            [...values, id]
        )
        return result.rows[0] ?? null
    }

    async updateStock(cartItems){
        try{

            const promises = [];

            cartItems.forEach( item =>{
               promises.push(
                    this.pool.query(
                        `UPDATE products SET stock= stock - 1$ WHERE id=$2`,
                    [item.quantity, item.id]) 
                )
            })

            await Promise.all(promises);

        }catch(error){
            throw error
        }
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

    async verifyStock(product_id, quantity){
        try{
            const {rows} = await this.pool.query(
                `SELECT stock FROM products WHERE id=$1`,
                [product_id]
            )

            console.log("rows[0]: ", rows[0])

            if (!rows[0]) throw new Error('Producto no encontrado');
            return rows[0].stock >= quantity;

        }catch(error){
            console.log(error)
            throw(error);
        }

    }

}

module.exports = ProductsRepository