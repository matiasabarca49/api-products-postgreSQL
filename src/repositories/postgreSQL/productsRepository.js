const pool = require('../../config/pg.config.js');
const { NotFoundException, DuplicateException } = require('../../exceptions/validation.exception.js');
const {AppError} = require('../../exceptions/excepciones.js');

class ProductsRepository{

    constructor() {
        this.pool = pool
    }

    /**
     * Obtener productos para la tienda con paginación, filtro y ordenamiento.
     * Paginacion:
     * @param {number} [limit=10]
     * @param {number} [page=1]
     * @param {number} [sort=1]
     * Filtros:
     * @param {Object} filters - Objeto con los filtros a aplicar (title, category, priceMin, priceMax)
     * @param {string} [filters.title] - Filtro de búsqueda parcial por título
     * @param {string} [filters.category_id] - Filtro por categoría
     * @returns {Promise<Array<Object>>} Objeto con los productos encontrados y la información de paginación 
     */
    async findAll(filters = {}, limit = 10, page = 1, sort = 1) {
        try{
            const offset = (page - 1) * limit
    
            let title;
            let status;
    
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
                    `SELECT p.*, c.name AS category,
                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'seller_id', u.id,
                                    'name', u.name,
                                    'price', sp.price,
                                    'stock', sp.stock
                                )
                                ORDER BY sp.price ASC
                            )
                            FROM seller_products sp 
                            LEFT JOIN users u ON u.id = sp.seller_id
                            WHERE sp.product_id = p.id  
                            AND sp.status = true
                        ),
                        '[]'
                    ) AS sellers
                    FROM products p
                    LEFT JOIN categories c ON c.id = p.category_id
                    ${dataWhere}
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
                payload: dataResult.rows,
                totalDocs,
                totalPages,
                page,
                limit,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            }
        }catch(error){
            throw error;
        }
    }
    
   /**
     * Obtener productos para la administración con paginación, filtro y ordenamiento.
     * Paginacion:
     * @param {number} [limit=10]
     * @param {number} [page=1]
     * @param {number} [sort=1]
     * Filtros:
     * @param {Object} filters - Objeto con los filtros a aplicar (title, category, priceMin, priceMax)
     * @param {string} [filters.title] - Filtro de búsqueda parcial por título
     * @param {string} [filters.category_id] - Filtro por categoría
     * @returns {Promise<Array<Object>>} Objeto con los productos encontrados y la información de paginación 
     */
    async findAllAdmin(filters = {}, limit = 10, page = 1, sort = 1) {
        try{

            const offset = (page - 1) * limit
    
            let title;
            let seller_id;
    
            if(filters.title){
                title = filters.title;
                delete filters.title;
            }

            if(filters.seller_id){
                seller_id = filters.seller_id;
                delete filters.seller_id;
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

            if(seller_id){
                dataWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}sp.seller_id = $${filterKeys.length + 3}`; 
                countWhere += `${filterKeys.length > 0 ? ' AND ' : 'WHERE '}sp.seller_id = $${filterKeys.length + 1}`
                filterValues.push(seller_id);
            }
    
            const [dataResult, countResult] = await Promise.all([
                this.pool.query(
                    `SELECT sp.stock, sp.price, sp.status AS seller_status, sp.id AS seller_product_id, sp.seller_id,
                    p.id AS product_id, p.title, p.code, p.description, p.thumbnail, p.status AS product_status,
                    c.name AS category, 
                    u.name AS store_name
                    FROM seller_products sp
                    LEFT JOIN products p ON p.id = sp.product_id
                    LEFT JOIN categories c ON c.id = p.category_id
                    LEFT JOIN users u ON u.id = sp.seller_id
                    ${dataWhere}
                    ORDER BY ${sort && sort? `sp.price ${sort > 0 ? 'ASC' : 'DESC'}` : 'id ASC'}
                    LIMIT $1 OFFSET $2
                    `,
                    [limit, offset, ...filterValues]
                ),
                this.pool.query(
                    `SELECT COUNT(*) FROM seller_products sp ${countWhere}`,
                    filterValues
                )
            ])
    
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
        }catch(error){
            throw error
        }
    }

    /**
     * Buscar un producto por ID de seller_product. La relacion entre productos y users 
     * es a través de seller_products, por lo que se debe buscar el producto a través de su ID 
     * en seller_products para luego retornar la información del producto encontrado. 
     * Si no se encuentra el producto con el ID proporcionado, retornar null.
     * @param {number} id - ID del producto a buscar
     * @returns {Promise<Object>} Producto encontrado
     */
    async findByIdSeller(idProduct, idSeller) {

        const result = await this.pool.query(
            `
            SELECT 
                p.id, p.title, p.description, p.code, p.thumbnail, p.status AS product_status,
                c.name AS category,
                sp.price, sp.stock, sp.status AS seller_status, sp.id AS seller_product_id,
                u.name AS store_name,
                (
                    SELECT json_agg(
                    json_build_object(
                        'rating', com.rating,
                        'comment', com.comment,
                        'user_name', u.name
                        )
                    )
                    FROM comments com
                    LEFT JOIN users u ON com.user_id = u.id
                    WHERE com.product_id = p.id
                ) AS comments,
                (
                    SELECT AVG(rating) FROM comments WHERE product_id = p.id
                ) AS rating,
                (SELECT json_agg(
                    json_build_object(
                        'id', u.id,
                        'price', sp.price,
                        'name', u.name
                    ))
                    FROM seller_products sp
                    LEFT JOIN users u ON sp.seller_id = u.id
                    WHERE sp.product_id = p.id AND sp.seller_id != $2
                ) AS sellers
                FROM seller_products sp
                JOIN products p ON sp.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON sp.seller_id = u.id
                WHERE sp.product_id = $1 AND sp.seller_id = $2;
            `,
            [idProduct, idSeller]
        )
        return result.rows[0] ?? null
    }
    /**
     * Buscar un producto por ID de seller_product. La relacion entre productos y users 
     * es a través de seller_products, por lo que se debe buscar el producto a través de su ID 
     * en seller_products para luego retornar la información del producto encontrado. 
     * Si no se encuentra el producto con el ID proporcionado, retornar null.
     * @param {number} id - ID del producto a buscar
     * @returns {Promise<Object>} Producto encontrado
     */
    async findByID(idProduct) {

        const result = await this.pool.query(
            `
            SELECT 
                p.id, p.title, p.description, p.code, p.thumbnail, p.status,
                c.name AS category,
                sp.price, sp.stock,
                u.name AS store_name,
                (
                    SELECT json_agg(
                    json_build_object(
                        'rating', com.rating,
                        'comment', com.comment,
                        'user_name', u.name
                        )
                    )
                    FROM comments com
                    LEFT JOIN users u ON com.user_id = u.id
                    WHERE com.product_id = p.id
                ) AS comments,
                (
                    SELECT AVG(rating) FROM comments WHERE product_id = p.id
                ) AS rating
                FROM seller_products sp
                JOIN products p ON sp.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON sp.seller_id = u.id
                WHERE sp.product_id = $1;
            `,
            [idProduct]
        )
        return result.rows[0] ?? null
    }

    /**
     * Verificar si existe un producto por su ID
     * @param {number} id - ID del producto a verificar
     * @returns {Promise<boolean>} Retorna true si el producto existe, false si no existe
     */
    async existByID(id) {
        const result = await this.pool.query(
            `SELECT 1 FROM products WHERE id = $1`,
            [id]
        )
        return result.rowCount > 0
    }

    /**
     * Buscar el ID de una categoría por su nombre
     * @param {string} categoryName - Nombre de la categoría a buscar
     * @returns {Promise<number|null>} Retorna el ID de la categoría si se encuentra, o null si no se encuentra
     */
    async findCategoryByName(categoryName) {
        const result = await this.pool.query(
            `SELECT id FROM categories WHERE name = $1`,
            [categoryName]
        )
        return result.rows[0]?.id ?? null
    }

    async findByCode(code){
        try{
            const result = await this.pool.query(
                `SELECT * FROM products WHERE code = $1`,
                [code]
            )
            return result.rows[0] ?? null;
        }catch(error){
            throw error;
        }
    }

    async existByCode(code){
        try{
            const result = await this.pool.query(
                `SELECT 1 FROM products WHERE code = $1`,
                [code]
            )
            return result.rows.length > 0;
        }catch(error){
            throw error;
        }
    }

    /**
     * Crear un nuevo producto
     * @param {Object} data - Objeto con los datos del producto a crear
     * @returns {Promise<Object>} Producto creado
     * @throws {DuplicateException} Si se intenta crear un producto con un code o title que ya existe en la base de datos
     */
    async create(data) {
        try{
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
        }catch(error){
            if (error.code === '23505') {
                throw new DuplicateException("Code o Titulo Duplicado");
            }

            throw error;
        }
    }

    /**
     * Asociar usuario y producto a través de seller_products
     * @param {Object} sellerProduct - Objeto con los datos para asociar el producto al usuario
     * @param {number} sellerProduct.product_id - ID del producto a asociar
     * @param {number} sellerProduct.user_id - ID del usuario a asociar
     * @param {number} sellerProduct.stock - Stock del producto para ese usuario
     * @param {number} sellerProduct.price - Precio del producto para ese usuario
     * @returns {Promise<void>} No retorna nada, pero lanza un error si ocurre un error durante la asociación
     */
    async associateProductToSeller(sellerProduct){
        try{
            const keys = Object.keys(sellerProduct);
            const values = Object.values(sellerProduct);

            const preholders  = keys.map((_, i) => `$${i + 1}`).join(",");
            const columns = keys.join(",");
            
            await this.pool.query(
                `INSERT INTO seller_products (${columns})
                VALUES(${preholders})`,
                values
            )
            return;

        }catch(error){
            if(error.code === '23505') {
                throw new DuplicateException("El producto o codigo ya está asociado a este vendedor");
            }
            throw error;
        }
    }


    /**
     * Agregar comentario a un producto
     */
    async addComment(comment){
        try{

            const values = Object.values(comment);
            const keys = Object.keys(comment);

            const placeHolders = keys.map( (_, i) => `$${i +1}` ).join(", ");
            const columns = keys.map( key => `${key}`).join(", ")


            const sql = `
                INSERT INTO comments (${columns})
                VALUES(${placeHolders})
                RETURNING*
            `

            const result = await this.pool.query(sql, values)

            return result.rows;

        }catch(error){
            if(error.code === '23505') {
                throw new DuplicateException("El usuario ya comentó este producto");
            }
            throw error;
        }  
    }


    /**
     * Actualizar un producto por su ID
     * @param {number} id - ID del producto a actualizar
     * @param {Object} data - Objeto con los datos a actualizar del producto
     * @returns {Promise<Object>} Producto actualizado
     * @throws {Error} Si ocurre un error durante la actualización del producto
     */
    async update(id, data) {
        try{
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
        }catch(error){
            throw error;
        }
    }

/**
 * Actualizar stock de un producto
 */
async updateProductFromSeller(product_id, seller_id, dataToUpdate){
    try{
        const values = Object.values(dataToUpdate);
        const keys = Object.keys(dataToUpdate) ;
        const sets = keys.map((key, i) =>  `${key} = $${i + 3}`).join(" , ");

        const sql = ` 
            UPDATE seller_products 
            SET ${sets} 
            WHERE product_id=$1 AND seller_id=$2 
            RETURNING *
        `

        const result = await this.pool.query(sql, [product_id, seller_id, ...values]);

        return result.rows;

    }catch(error){
        throw error
    }
}

/**
 * Actualizar el stock de los productos en el carrito
 * @param {Array<{id: number, quantity: number}>} cartItems - Array con los productos del carrito, cada uno con su ID y la cantidad a comprar
 * @returns {Promise<void>} No retorna nada, pero lanza un error si no hay stock suficiente para alguno de los productos o si ocurre un error durante la actualización
 * @throws {AppError} Si no hay stock suficiente para alguno de los productos del carrito
 * @throws {Error} Si ocurre un error durante la actualización del stock de los productos
 */
  async updateStockCartItems(cartItems) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            for (const item of cartItems) {
                const result = await client.query(
                    `UPDATE products 
                    SET stock = stock - $1 
                    WHERE id = $2 
                    AND stock >= $1
                    RETURNING *`,
                    [item.quantity, item.id]
                );

                if (result.rowCount === 0) {
                    throw new AppError(`Stock insuficiente para producto ${item.id}`);
                }
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
     * Eliminar un producto por su ID
     * @param {number} id - ID del producto a eliminar
     * @returns {Promise<Object>} Producto eliminado
     * @throws {Error} Si ocurre un error durante la eliminación del producto
     */
    async delete(id) {
        try{
            const result = await this.pool.query(
                `DELETE FROM products
                 WHERE id = $1
                 RETURNING *`,
                [id]
            )
            return result.rows[0] ?? null
        }catch(error){
            throw error;
        };
        
    }

    /**
     * Eliminar un producto por su ID
     * @param {number} id - ID del producto a eliminar
     * @returns {Promise<Object>} Producto eliminado
     * @throws {Error} Si ocurre un error durante la eliminación del producto
     */
    async deleteFromSeller(id_product_seller) {
        try{
            const result = await this.pool.query(
                `DELETE FROM seller_products
                 WHERE id = $1
                 RETURNING *`,
                [id_product_seller]
            )
            return result.rows[0] ?? null
        }catch(error){
            throw error;
        };
        
    }

    /**
     * Verificar si hay stock suficiente para un producto dado su ID y la cantidad requerida
     * @param {number} product_id - ID del producto a verificar
     * @param {number} quantity - Cantidad requerida para la compra
     * @returns {Promise<boolean>} Retorna true si hay stock suficiente, false si no lo hay
     */
    async verifyStock(seller_product_id, quantity){
        try{
            const {rows} = await this.pool.query(
                `SELECT stock FROM seller_products WHERE id=$1`,
                [seller_product_id]
            )

            if (!rows[0]) throw new NotFoundException("Producto no encontrado");
            return rows[0].stock >= quantity;

        }catch(error){
            throw(error);
        }

    }

}

module.exports = ProductsRepository