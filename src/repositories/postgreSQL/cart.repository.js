const pool = require('../../config/pg.config.js');

class CartRepository{

    constructor() {
        this.pool = pool
    }

    /**
     * Obtiene una lista paginada de carritos con sus respectivos productos.
     * * @param {number} [limit=10] - Cantidad de registros por página.
     * @param {number} [page=1] - Número de página actual.
     * @param {number} [sort=1] - Dirección del ordenamiento (1 para ASC, -1 para DESC).
     * @returns {Promise<Object>} Objeto con los carritos, total de páginas y metadatos de navegación.
     */
    async findAll(limit = 10, page = 1, sort = 1) {
        const offset = (page - 1) * limit

        const [dataResult, countResult] = await Promise.all([
            this.pool.query(
                `SELECT p.*, c.id AS cart_id, c.date_cart AS date_cart, cp.quantity AS quantity
                FROM carts c
                JOIN cart_products cp ON cp.cart_id = c.id
                JOIN seller_products sp ON sp.id = cp.seller_product_id
                JOIN products p ON p.id = sp.product_id
                ORDER BY ${sort && sort? `c.id ${sort > 0 ? 'ASC' : 'DESC'}` : 'c.id ASC'}
                LIMIT $1 OFFSET $2
                `,
                [limit, offset]
            ),
            this.pool.query(
                `SELECT COUNT(*) FROM carts`
            )
        ])
        const totalDocs  = parseInt(countResult.rows[0].count)
        const totalPages = Math.ceil(totalDocs / limit)

        const { rows } = dataResult;

        /**
         * Transformación de datos:
         * Como la consulta SQL devuelve una fila por cada producto (repitiendo datos del carrito),
         * agrupamos los productos dentro de su carrito correspondiente usando .reduce()
         */
        const carts = rows.reduce((acc, row) => {
            let cart = acc.find(c => c.cart_id === row.cart_id);
            
            if (!cart) {
                const { cart_id, date_cart } = row;
                cart = { cart_id, date_cart, products: [] };
                acc.push(cart);
            }

            cart.products.push({
                id: row.product_id,
                title: row.title,
                price: row.price,
                quantity: row.quantity,
                thumbnail: row.thumbnail
            });

            return acc;
        }, []);
        

        // Retornamos la estructura final
        return {
            payload: carts,
            totalDocs,
            totalPages,
            page,
            limit,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        }
    }

    /**
     * Obtiene un carrito por id.
     * * @param {number} id - Cantidad de registros por página.
     * @returns {Promise<Object> | null} Objeto con los carritos, total de páginas y metadatos de navegación.
     */
    async findById(id) {
        const result = await this.pool.query(
            `SELECT * FROM carts
             WHERE id = $1`,
            [id]
        )
        return result.rows[0] ?? null
    }

    /**
   * Verifica si carrito ya existe en la DB.
   * @param {number} userId - Identificador del usuario.
   * @param {number} productId - Identificador del producto.
   * @returns {Promise<boolean>} True si el carrito ya existe en la DB, false en caso contrario.
   */
    async existByID(id) {
        const result = await this.pool.query(
            `SELECT 1 FROM carts WHERE id = $1`,
            [id]
        )
        return result.rowCount > 0
    }

    /**
     * Crear un carrito en la DB
     * @param {Object} data 
     * @returns 
     */
    async create(data) {
        const keys   = Object.keys(data)
        const values = Object.values(data)

        // Genera: ($1, $2, $3, ...)
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
        const columns      = keys.join(', ')

        const result = await this.pool.query(
            `INSERT INTO carts (${columns})
             VALUES (${placeholders})
             RETURNING *`,
            values
        )
        return result.rows[0]
    }

    /**
     * Asignar productos al carrito que existe en la DB.
     * @param {number} cart_id 
     * @param {Array<Object>} cartItems 
     */
    async assignProductsToCart(cart_id, cartItems) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            for (const item of cartItems) {
                const { id, quantity } = item;
                await client.query(
                    `INSERT INTO cart_products (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
                    [cart_id, id, quantity]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Sumar el total de un carrito en DB
     * @param {number} cart_id 
     * @returns {Promise<Object>} Retornar una promesa. La promesa resuelve en un objeto que nos dice el total y cantidad
     * de productos en un carrito
     */
    async sumTotal(cart_id) {
        const result = await this.pool.query(
            `SELECT SUM(p.price * cp.quantity) AS total, SUM(cp.quantity) AS cant_product
             FROM cart_products cp
             JOIN products p ON cp.product_id = p.id
             WHERE cp.cart_id = $1`,
            [cart_id]
        )
        return { 
            total: result.rows[0].total ?? 0,
            amount: result.rows[0].cant_product ?? 0
        }
    }

    /**
     * Actualizar carrito por ID
     * @param {number} id 
     * @param {Object} data - Objeto que contiene la actualizacion de una fila en la tabla carts
     * @returns {Promise<Object>}
     */
    async update(id, data) {
        const keys   = Object.keys(data)
        const values = Object.values(data)

        // Genera: title = $1, price = $2, ...
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')

        const result = await this.pool.query(
            `UPDATE carts
             SET ${setClause}
             WHERE id = $${keys.length + 1}
             RETURNING *`,
            [...values, id]
        )

        return result.rows[0] ?? null
    }

    /**
     * Eliminar un carrito de la DB
     * @param {number} id 
     * @returns {Promise<Object>}
     */
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

module.exports = CartRepository;