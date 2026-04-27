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
                    u.name AS buyer_name, u.email AS buyer_email, u.dni AS buyer_dni,
                    a.street, a.city, a.province, a.postal_code,
                    sl.status, sl.delivery_type,
                    (
                        SELECT SUM(cp.quantity)
                        FROM cart_products cp
                        JOIN seller_products sp ON sp.id = cp.seller_product_id
                        WHERE cp.cart_id = c.id
                        AND sp.seller_id = $1
                    ) AS amount,
                    (
                        SELECT SUM(cp.quantity*cp.price)
                        FROM cart_products cp
                        JOIN seller_products sp ON sp.id = cp.seller_product_id
                        WHERE cp.cart_id = c.id
                        AND sp.seller_id = $1
                    ) AS total,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'title', p.title,
                                'price', cp.price,
                                'quantity', cp.quantity
                            )
                        )
                        FROM cart_products cp
                        JOIN seller_products sp ON sp.id = cp.seller_product_id
                        JOIN products p ON p.id = sp.product_id
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
                JOIN addresses a ON a.user_id = u.id
                JOIN carts c ON c.id = sl.cart_id

                ORDER BY c.id DESC
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

            console.log(dataResult.rows);

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
}

module.exports = SalesRepository;