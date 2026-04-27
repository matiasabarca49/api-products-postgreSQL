const pool = require('../../config/pg.config.js');
const CartRepository = require('./cart.repository.js');
const CartItemRepository = require('./cartItem.repository.js');
const ProductsRepository = require('./productsRepository.js');
const TicketRepository = require('./ticket.repository.js');

class PurchaseRepository{
    constructor() {
        this.pool = pool;
        this.cartItemRepository = new CartItemRepository();
        this.cartRepository = new CartRepository();
        this.productRepository = new ProductsRepository();
        this.ticketRepository = new TicketRepository();
    }

    /**
     * Obtiene todas las compras del usuario con paginación.
     * @param {number} idUser 
     * @param {number} [limit=10] 
     * @param {number} [page=1] 
     * @returns {Promise<Object>} Resultado con las compras y metadata de paginación.
     */
    async findAll(idUser, limit = 10, page= 1){
        try{
            const offset = ( page - 1 ) * limit;


            const sqlData = 
            `
                SELECT pc.cart_id, pc.date_cart, p.title, cp.price, cp.quantity, sp.seller_id, u.name AS store_name
                FROM (
                    SELECT * FROM purchases
                    WHERE user_id = $1
                    ORDER BY cart_id DESC
                    LIMIT $2 OFFSET $3
                ) pc
                JOIN cart_products cp ON cp.cart_id = pc.cart_id
                JOIN seller_products sp ON sp.id = cp.seller_product_id
                JOIN users u ON u.id = sp.seller_id
                JOIN products p ON p.id = sp.product_id
                ORDER BY pc.cart_id DESC
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
                        store_name: row.store_name,
                        id_seller: row.seller_id
                    }
                )

                purchase.total =  purchase.total ?   purchase.total + parseFloat(row.price * row.quantity)  : parseFloat(row.price * row.quantity); 
                purchase.amount = purchase.amount ?   purchase.amount + row.quantity  : 1;

                return acc;

            },[])

            const totalDocs  = parseInt(countResult.rows[0].count)
            const totalPages = Math.ceil(totalDocs / limit)

            return {
                payload: purchases,
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
     * Completa el proceso de compra del carrito del usuario.
      * Con Transacción, manejo de errores y rollback.
     * @param {number} idUser 
     * @param {Array<Object>} cartItems 
     * @returns {Promise<Object>} Ticket generado por la compra
     */
    async checkout(idUser, cartItems){
        const client = await this.pool.connect();
        try{
            //Comenzamos transaccion
            await client.query('BEGIN');
            
            //3-Crear registro en carts 
             const { rows: [cart] } = await client.query(
                `INSERT INTO carts (date_cart) VALUES (NOW()) RETURNING *`
            );
            console.log("Carrito creado en DB......")
            //4-Insertar en cart_products los productos que sí tienen stock
            for (const item of cartItems) {
                await client.query(
                    `INSERT INTO cart_products (cart_id, seller_product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
                    [cart.id, item.seller_product_id, item.quantity, item.price]
                );
            }
            console.log("Productos asignados a Carrito en DB......")
            //Contar cantidad de productos
             const cantProd = await client.query(
                `SELECT SUM(cp.price * cp.quantity) AS total, SUM(cp.quantity) AS cant_product
                FROM cart_products cp
                WHERE cp.cart_id = $1`,
                [cart.id]
            )
            
            const total  = cantProd.rows[0].total ?? 0;
            const amount = cantProd.rows[0].cant_product ?? 0;
            
            console.log("Cantidad y total calculados......")
            //5- Descontar Stock
            for(const item of cartItems){
                await client.query(
                        `UPDATE seller_products SET stock= stock - $1 WHERE id=$2`,
                    [item.quantity, item.seller_product_id]
                )
            }
            console.log("Stock Descontado......");
            //6-Crear registro en purchases vinculando user + cart
            const { rows: [purchase] } = await client.query(
            `INSERT INTO purchases (user_id, cart_id, date_cart) VALUES ($1, $2, $3) RETURNING *`,
            [idUser, cart.id, cart.date_cart]
            );
            console.log("Compra creada......")
            //7-Crear el ticket con el monto total
            const date = new Date(cart.date_cart);
            const formatDate = `${date.getUTCFullYear()}${date.getMonth()+1}${date.getDate()}`
            const code = `TICKET-${formatDate}-${Math.floor(Math.random() * 1000)}-${purchase.id}-${cart.id}-${idUser}`;
            
            
            const { rows: [ticket] } = await client.query(
                `INSERT INTO tickets (code, amount, total, user_id, cart_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [code, amount, total, idUser, cart.id]
            );
            
            console.log("Ticket creado.....")

            //8 - Generar venta(sale)

            for(const item of cartItems){
                await client.query(
                    `INSERT INTO sales (ticket_id, seller_id, buyer_id, product_id, cart_id,quantity, price, total, status, delivery_type)
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8,'pending', 'shipping')`,
                    [ticket.id, item.seller_id, idUser, item.id, cart.id, item.quantity, item.price, item.price * item.quantity]
                )
            }

            console.log("Venta generada...")
            //9-Vaciar cart_items del usuario

            for (const item of cartItems) {
                await client.query(
             `
                DELETE FROM cart_items
                WHERE user_id = $1 AND seller_product_id = $2
                RETURNING *
                `, 
                [idUser, item.seller_product_id])
            }

            console.log("Productos del carrito del usuario removidos.....")
            //Si tenemos exito persistimos todas las transacciones
            await client.query('COMMIT');

            console.log("Fin transaccion ---------")

            return ticket;

        }catch(error){
            await client.query('ROLLBACK');
            throw error;
        }finally{
            client.release();
        }
    }
}

module.exports = PurchaseRepository;