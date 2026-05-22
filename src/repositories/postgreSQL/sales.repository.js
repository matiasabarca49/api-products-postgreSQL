const pool = require('../../config/pg.config.js');

class SalesRepository{
    constructor(){
        this.pool = pool;
    }

    async findAll(idUser, limit = 10, page= 1){
        try{
            const offset = ( page - 1 ) * limit;

            const sqlData = 
            `
                SELECT 
                    c.date_cart, 
                    u.name AS buyer_name, 
                    u.email AS buyer_email, 
                    u.dni AS buyer_dni,
                    a.street, 
                    a.city, 
                    a.province, 
                    a.postal_code,
                    sl.status, 
                    sl.delivery_type,

                    (
                        SELECT SUM(cp.quantity)
                        FROM cart_products cp
                        JOIN seller_products sp ON sp.id = cp.seller_product_id
                        WHERE cp.cart_id = c.id
                        AND sp.seller_id = $1
                    ) AS amount,

                    (
                        SELECT SUM(cp.quantity * cp.price)
                        FROM cart_products cp
                        JOIN seller_products sp ON sp.id = cp.seller_product_id
                        WHERE cp.cart_id = c.id
                        AND sp.seller_id = $1
                    ) AS total,

                    (
                        SELECT json_agg(
                            json_build_object(
                                'id_sale', s.id,
                                'title', p.title,
                                'price', cp.price,
                                'quantity', cp.quantity
                            )
                        )
                        FROM cart_products cp
                        JOIN seller_products sp ON sp.id = cp.seller_product_id
                        JOIN products p ON p.id = sp.product_id
                        JOIN sales s 
                            ON s.product_id = p.id 
                        AND s.seller_id = sp.seller_id 
                        AND s.cart_id = cp.cart_id
                        WHERE cp.cart_id = c.id 
                        AND sp.seller_id = $1
                    ) AS products

                FROM (
                    SELECT DISTINCT cart_id, buyer_id, status, delivery_type
                    FROM sales
                    WHERE seller_id = $1
                    ORDER BY cart_id DESC
                    LIMIT $2 OFFSET $3
                ) sl

                JOIN users u ON u.id = sl.buyer_id

                LEFT JOIN addresses a ON a.user_id = u.id

                JOIN carts c ON c.id = sl.cart_id

                ORDER BY c.id DESC;
            `;

            const sqlCount = 
            `
                SELECT COUNT(DISTINCT cart_id) FROM sales
                WHERE seller_id = $1
            `;

            const [dataResult, countResult] = await Promise.all([
                this.pool.query(sqlData, [idUser, limit, offset]),
                this.pool.query(sqlCount, [idUser]),
            ]);

            const totalDocs  = parseInt(countResult.rows[0].count)
            const totalPages = Math.ceil(totalDocs / limit)
    
            return {
                payload: dataResult.rows,
                totalDocs,
                totalPages,
                page,
                limit,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            }

        }
        catch(error){
            throw error;
        }
    }

    /**
     * Cambia el estado de una venta. El nuevo estado debe ser uno de los siguientes:
     *  'pending', 'processed', 'shipped', 'delivered', 'cancelled' o 'approved'.
     * Este método utiliza transacciones para asegurar que todas las actualizaciones se realicen de manera atómica. 
     * @param {Array} ids - Un array de IDs de ventas a actualizar.
     * @param {String} newState - El nuevo estado a asignar a las ventas.
     */
    async changeState(ids, status){
        //obtenemos el cliente
        const client = await this.pool.connect();
        try{
            client.query('BEGIN');

            const sql = 
            `
                UPDATE sales
                SET status = $1
                WHERE id = $2
                RETURNING *
            `;
            for (const idSale of ids) {

                await client.query(sql, [status, idSale]);

            }

            client.query('COMMIT');
    
        }
        catch(error){
            client.query('ROLLBACK');
            throw error;
        }finally{
            client.release();
        }
    }


    async existsById(id){
        try{
            const result = await this.pool.query("SELECT 1 FROM sales WHERE id = $1", [id]);

            return result.rows > 0;

        }catch(error){
            return false;
        }
    }
}

module.exports = SalesRepository;