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

                purchase.total =  purchase.total ?   purchase.total + parseFloat(row.price * row.quantity)  : parseFloat(row.price * row.quantity); 
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

    async checkout(idUser, cartItems){
        const client = await this.pool.connect();
        try{
            //Comenzamos transaccion
            await client.query('BEGIN');

            /* console.log("Comenzando transaccion ---------")

            //1-Obtener cart_items del usuario
             const { rows : cartItems } = await client.query(
                `SELECT p.id, p.title, p.description, p.price, p.code, p.thumbnail, 
                c.name as category,
                ci.quantity 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE ci.user_id = $1
                `
                , [idUser]);
            console.log("Obteniendo Carrito del usuario ......")
            //2-Verificar stock por cada producto — los que no tienen stock se separan */
            
            
            //3-Crear registro en carts 
             const { rows: [cart] } = await client.query(
                `INSERT INTO carts (date_cart) VALUES (NOW()) RETURNING *`
            );
            console.log("Carrito creado en DB......")
            //4-Insertar en cart_products los productos que sí tienen stock
            for (const item of cartItems) {
                await client.query(
                    `INSERT INTO cart_products (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
                    [cart.id, item.id, item.quantity]
                );
            }
            console.log("Productos asignados a Carrito en DB......")
            //Contar cantidad de productos
             const cantProd = await client.query(
                `SELECT SUM(p.price * cp.quantity) AS total, SUM(cp.quantity) AS cant_product
                FROM cart_products cp
                JOIN products p ON cp.product_id = p.id
                WHERE cp.cart_id = $1`,
                [cart.id]
            )
            
            const total  = cantProd.rows[0].total ?? 0;
            const amount = cantProd.rows[0].cant_product ?? 0;
            
            console.log("Cantidad y total calculados......")
            //5- Descontar Stock
            for(const item of cartItems){
                await client.query(
                        `UPDATE products SET stock= stock - $1 WHERE id=$2`,
                    [item.quantity, item.id]
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
            //8-Vaciar cart_items del usuario

            for (const item of cartItems) {
                await client.query(
             `
                DELETE FROM cart_items
                WHERE user_id = $1 AND product_id = $2
                RETURNING *
                `, 
                [idUser, item.id])
            }

            console.log("Productos del carrito del usuario removidos.....")
            //Si tenemos exito persistimos todas las transacciones
            await client.query('COMMIT');

            console.log("Fin transaccion ---------")

            return ticket;

        }catch(error){
            console.log("Error transaccion X X X X X")
            console.log("Disparando RollBack")
            console.error(error)
            await client.query('ROLLBACK');
            throw error;
        }finally{
            client.release();
        }
    }
}

module.exports = PurchaseRepository;