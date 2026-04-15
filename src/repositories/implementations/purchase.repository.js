const pool = require('../../config/pg.config.js');

class PurchaseRepository{
    constructor() {
        this.pool = pool;
    }

    async findAll(idUser, limit = 10, page= 1){
        try{
            const offset = ( page - 1 ) * limit;


            const sqlData = 
            `
                SELECT pc.cart_id, pc.date_cart, p.title, p.price, cp.quantity
                FROM (
                    SELECT * FROM purchases
                    WHERE user_id = $1
                    ORDER BY cart_id
                    LIMIT $2 OFFSET $3
                ) pc
                JOIN cart_products cp ON cp.cart_id = pc.cart_id
                JOIN products p ON p.id = cp.product_id
            `;

            const sqlCount = 
            `
                SELECT COUNT(*) FROM purchases
                WHERE user_id = $1
            `;

            const [dateResult, countResult] = await Promise.all([
                this.pool.query(sqlData, [idUser, limit, offset]),
                this.pool.query(sqlCount, [idUser]),
            ]);

            const purchases = dateResult.rows.reduce( (acc, row) =>{

                let purchase;

                purchase = acc.find( p => p.cart_id === row.cart_id )

                if(!purchase){
                    purchase = {
                        cart_id: row.cart_id,
                        date_cart: row.date_cart,
                        products: []
                    }

                    acc.push(purchase);
                }

                purchase.products.push(
                    {
                        title: row.title,
                        price: row.price,
                        quantity: row.quantity,
                    }
                )

                purchase.total =  purchase.total ?   purchase.total + parseFloat(row.price)  : parseFloat(row.price); 
                purchase.amount = purchase.amount ?   purchase.amount + 1  : 1;

                return acc;

            },[])

            const totalDocs  = parseInt(countResult.rows[0].count)
            const totalPages = Math.ceil(totalDocs / limit)

            return {
                docs: purchases,
                totalDocs,
                totalPages,
                page,
                limit,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            }

        }catch(error){
            console.log(error);
            throw error
        }

    }

    async create(idUser, cart){
        try{
            const sql = `INSERT INTO purchases (user_id, cart_id, date_cart) VALUES ($1, $2, $3) RETURNING *`;

            const result = await this.pool.query(sql, [idUser, cart.id, cart.date_cart]);

            return result.rows[0];

        }catch(error){
            console.error('Error en create purchase: ', error);
            throw error;
        }
    }

}

module.exports = PurchaseRepository;