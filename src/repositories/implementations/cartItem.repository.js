const pool = require('../../config/pg.config.js');

class CartItemRepository{
    constructor(){
        this.pool = pool;
    }

    async getCartItemsByUser(idUser){
        try{
            const resutl = await this.pool.query(
                `SELECT p.id, p.title, p.description, p.price, p.code, p.thumbnail, 
                c.name as category,
                ci.quantity 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE ci.user_id = $1
                `
                , [idUser]);
    
            console.log("Cart items obtenidos para el usuario ", idUser, ": ", resutl.rows);
    
            return resutl.rows ?? [];
        }
        catch(error){
            console.error('Error en getCartItemsByUser: ', error);
            throw error;
        }
    }

    async getCantItemsInCart(idUser){
        try{
            const resutl = await this.pool.query(
                `SELECT SUM(quantity) as total_items
                FROM cart_items
                WHERE user_id = $1
                `
                , [idUser]);
    
            return resutl.rows[0].total_items ?? 0;
        }
        catch(error){
            console.error('Error al contar carrito: ', error);
            throw error;
        }
    }

    async addProductToCart(idUser, product_id, quantity = 1){
        try{
            
            if(await this.existsItem(idUser, product_id)){
                console.log("El producto ya existe en el carrito, actualizando cantidad...")
                return this.updateQuantity(idUser, product_id, quantity);
            }
    
            const resutl = await this.pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *'
            , [idUser, product_id, quantity])
        
            return resutl.rows[0]?? null;

        }catch(error){
            if (error.code === '23503') {
                if (error.constraint === 'cart_items_product_id_fkey') throw new Error('Producto no encontrado');
                if (error.constraint === 'cart_items_user_id_fkey') throw new Error('Usuario no encontrado');
            }
            console.error('Error en addProductToCart: ', error);
            throw error;
        }
    }

    async upsertItem(userId, productId, quantity) {
    const sql = `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING *
    `;
    const { rows } = await pool.query(sql, [userId, productId, quantity])
        .catch(error => {
            console.error('Error al actualizar la cantidad del producto en el carrito: ', error);
            throw error;
        });

    return rows[0];
  }

  async existsItem(userId, productId) {
    try{
        const sql = `
          SELECT 1 FROM cart_items
          WHERE user_id = $1 AND product_id = $2
        `;
        const { rowCount } = await pool.query(sql, [userId, productId])
        
        return rowCount > 0;
    }catch(error){
        console.error('Error al verificar la existencia del producto en el carrito: ', error);
        throw error;
    }
  }

  async updateQuantity(userId, productId, quantity = 1) {
    try{
        const sql = `
          UPDATE cart_items
          SET quantity = quantity + $3
          WHERE user_id = $1 AND product_id = $2
          RETURNING *
        `;
        const { rows } = await pool.query(sql, [userId, productId, quantity])
            
        return rows[0];
    }catch(error){
        console.error('Error en updateQuantity: ', error);
        throw error;
    }
  }

  async removeProductFromCart(userId, productId) {
    try{
        const sql = `
          DELETE FROM cart_items
          WHERE user_id = $1 AND product_id = $2
          RETURNING *
        `;
        const { rows } = await pool.query(sql, [userId, productId])
            
        return rows[0] ?? null;

    }catch(error){
        console.error('Error al borrar producto: ', error);
        throw error;
    }
  }

  async removeAllProductFromCart(idUser){
    
    try{
        const sql = `DELETE FROM cart_items WHERE user_id= $1`
        const result = this.pool.query(sql, [idUser]);

        return result.rows ?? null
    }catch(error){
        console.log(error)
        throw error
    }
  }

}

module.exports = CartItemRepository