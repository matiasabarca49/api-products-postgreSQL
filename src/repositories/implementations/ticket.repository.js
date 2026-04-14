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
                                p.price,
                                p.thumbnail
                            FROM tickets t
                            JOIN cart_products cp ON cp.cart_id = t.cart_id
                            JOIN products p ON p.id = cp.product_id
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
    }

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