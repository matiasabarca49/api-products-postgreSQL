const pool = require('../../config/pg.config.js');
const { NotFoundException } = require('../../exceptions/validation.exception.js');

class CartItemRepository{
    constructor(){
        this.pool = pool;
    }

    /**
     * Obtiene todos los artículos en el carrito de un usuario específico.
     * * @param {number} idUser - El ID del usuario de la sesión.
     * @returns {Promise<Array<Object>>} Una promesa que resuelve a una lista de objetos con los detalles del producto y la cantidad.
     * @throws {Error} Si ocurre un error en la consulta a la base de datos.
     */
    async getCartItemsByUser(idUser){
        try{
            const result = await this.pool.query(
                `SELECT p.id, p.title, p.description, p.price, p.code, p.thumbnail, 
                c.name as category,
                ci.quantity 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE ci.user_id = $1
                `
                , [idUser]);
    
            return result.rows ?? [];
        }
        catch(error){
            throw error;
        }
    }


    /**
     * Obtiene la cantidad de artículos en el carrito de un usuario específico.
     * * @param {number} idUser - El ID del usuario de la sesión.
     * @returns {Promise} Una promesa que resuelve la cantidad de items del usuario
     * @throws {Error} Si ocurre un error en la consulta a la base de datos.
     */
    async getCantItemsInCart(idUser){
        try{
            const result = await this.pool.query(
                `SELECT SUM(quantity) as total_items
                FROM cart_items
                WHERE user_id = $1
                `
                , [idUser]);

            return result.rows[0].total_items ?? 0;
        }
        catch(error){
            throw error;
        }
    }


    /**
     * Agrega un producto al carrito o actualiza su cantidad si ya existe.
     * * @param {number} idUser - ID del usuario propietario del carrito.
     * @param {number} product_id - ID del producto a añadir.
     * @param {number} [quantity=1] - Cantidad del producto (por defecto 1).
     * @returns {Promise<Object> | null} Objeto del item de carrito creado, actualizado o null.
     * @throws {NotFoundException} Si el usuario o el producto no existen (Error 23503).
     * @throws {Error} Para otros errores de base de datos.
     */
    async addProductToCart(idUser, product_id, quantity = 1){
        try{
            
            if(await this.existsItem(idUser, product_id)){
                return await this.updateQuantity(idUser, product_id, quantity);
            }
    
            const result = await this.pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *'
            , [idUser, product_id, quantity])
        
            return result.rows[0]?? null;

        }catch(error){
            if (error.code === '23503') {
                if (error.constraint === 'cart_items_product_id_fkey') throw new NotFoundException('Producto no encontrado');
                if (error.constraint === 'cart_items_user_id_fkey') throw new NotFoundException('Usuario no encontrado');
            }
            throw error;
        }
    }


  /**
   * Verifica si un producto ya existe en el carrito de un usuario.
   * @param {number} userId - Identificador del usuario.
   * @param {number} productId - Identificador del producto.
   * @returns {Promise<boolean>} True si el producto ya está en el carrito, false en caso contrario.
   * @throws {Error} Si ocurre un error en la conexión o consulta a la base de datos.
   */
  async existsItem(userId, productId) {
    try{
        const sql = `
          SELECT 1 FROM cart_items
          WHERE user_id = $1 AND product_id = $2
        `;
        const { rowCount } = await pool.query(sql, [userId, productId])
        
        return rowCount > 0;
    }catch(error){
        throw error;
    }
  }

  /**
   * Actualizar la cantidad de un producto del carrito del usuario
   * @param {number} userId - Identificador del usuario.
   * @param {number} productId - Identificador del producto.
   * @param {number} quantity 
   * @returns {Promise<Object>} item con la cantidad actualizada
   * @throws {Error} Si ocurre un error en la conexión o en la actualizacion.
   */
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
        throw error;
    }
  }

  /**
   * Remover un producto del carrito del usuario
   * @param {number} userId - Identificador del usuario.
   * @param {number} productId - Identificador del producto.
   * @returns {Promise<Object> | null} Retorna el objeto eliminado o null
   * @throws {Error} Si ocurre un error en la conexión o en la actualizacion.
   */
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
        throw error;
    }
  }

  /**
   * Remover todos los productos del carrito del usuario
   * @param {number} userId - Identificador del usuario.
   * @returns {Promise<Array<Object>>} 
   * @throws {Error} Si ocurre un error en la base de datos. 
   */
  async removeAllProductFromCart(idUser){
    
    try{
        const sql = `DELETE FROM cart_items WHERE user_id= $1`
        const result = await this.pool.query(sql, [idUser]);

        return result.rows ?? null
    }catch(error){
        throw error
    }
  }

}

module.exports = CartItemRepository