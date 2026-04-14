const pool = require('../../config/pg.config.js');

class PurchaseRepository{
    constructor() {
        this.pool = pool;
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