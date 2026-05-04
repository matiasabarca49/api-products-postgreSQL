const pool = require('../../config/pg.config.js');

class TicketRepository{
    constructor(){
        this.pool = pool
    }

    async findTicketByCode(code){
        try{
            const sql = `
                            SELECT 
                                t.*,
                                u.name,
                                u.last_name,
                                u.email,
                                cp.quantity,
                                p.id AS product_id,
                                p.title,
                                p.thumbnail,
                                (
                                    SELECT json_agg(
                                        json_build_object(
                                         'id_seller', u.id,
                                         'store_name', s.name,
                                         'product_id', p.id,
                                         'title', p.title,
                                         'price', cp.price,
                                         'thumbnail', p.thumbnail,
                                         'quantity', cp.quantity
                                    ))
                                     FROM cart_products cp
                                     JOIN seller_products sp ON sp.id = cp.seller_product_id
                                     JOIN products p on p.id = sp.product_id
                                     JOIN users u ON u.id = sp.seller_id
                                     JOIN stores s ON s.user_id = u.id
                                     WHERE cp.cart_id = t.cart_id
                                ) AS products
                            FROM tickets t
                            JOIN cart_products cp ON cp.cart_id = t.cart_id
                            JOIN seller_products sp ON sp.id = cp.seller_product_id
                            JOIN products p ON p.id = sp.product_id
                            JOIN users u ON u.id = t.user_id
                            WHERE t.code = $1
                        `
            const { rows } = await this.pool.query(sql, [code]);

            const { cart_id, user_id, name, last_name, email, product_id, title, price, thumbnail, quantity, ...ticket } = rows[0];

            return {
                ...ticket,  // datos del ticket
                purchaser:{
                    name: rows[0].name,
                    last_name: rows[0].last_name,
                    email: rows[0].email
                }
            };
        }catch(error){
            console.error(error);
            throw error
        }
    }
    /* async findTicketByCode(code){
        try{
            const sql = `
                            SELECT 
                                t.*,
                                u.name,
                                u.last_name,
                                u.email,
                                cp.quantity,
                                p.id AS product_id,
                                p.title,
                                sp.price,
                                p.thumbnail
                            FROM tickets t
                            JOIN cart_products cp ON cp.cart_id = t.cart_id
                            JOIN seller_products sp ON sp.id = cp.seller_product_id
                            JOIN products p ON p.id = sp.product_id
                            JOIN users u ON u.id = t.user_id
                            WHERE t.code = $1
                        `
            const { rows } = await this.pool.query(sql, [code]);

            const { cart_id, user_id, name, last_name, email, product_id, title, price, thumbnail, quantity, ...ticket } = rows[0];

            return {
                ...ticket,  // datos del ticket
                products: rows.map(r => ({
                    id: r.product_id,
                    title: r.title,
                    price: r.price,
                    quantity: r.quantity,
                    thumbnail: r.thumbnail
                })),
                purchaser:{
                    name: rows[0].name,
                    last_name: rows[0].last_name,
                    email: rows[0].email
                }
            };
        }catch(error){
            console.error(error);
            throw error
        }
    } */

    async create(ticketData){
        const keys = Object.keys(ticketData);
        const values = Object.values(ticketData);

        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const columns      = keys.join(', ')

        const result = await this.pool.query(
            `INSERT INTO tickets (${columns})
             VALUES (${placeholders})
             RETURNING *`,
            values
        )
        return result.rows[0]
    }
}

module.exports = TicketRepository;