const PurchaseRepository = require("../repositories/postgreSQL/purchase.repository.js");
const { sendEmailPurchase } = require("../utils/mail.halper.js");
const CartItemService = require("./cartItem.service.js");
const ProductsService = require("./products.service.js");
const TicketService = require("./ticket.service.js");

class PurchaseService {
    constructor(){
        this.repository  = new PurchaseRepository();
        this.cartItemService = new CartItemService();
        this.productService = new ProductsService();
        this.ticketService = new TicketService()
    }

    /**
     * Obtener las compras del usuario logueado con paginación.
      * Se debe estar logueado para acceder a esta información.
      * @param {number} idUser 
      * @param {number} limit 
      * @param {number} page 
      * @returns {Promise<Array>} Lista de compras del usuario.
     */
    async getPurchasesByUser(idUser, limit = 10, page = 1){
        return this.repository.findAll(idUser, limit, page);
    }

    /**
     * Realiza el proceso de compra del carrito del usuario. 
     * Con Transacción, manejo de errores y rollback.
     * @param {*} idUser 
     * @returns 
     */
    async checkout(idUser, emailUser){
        //1 Obtener productos agregados al carrito
        const cartItems = await this.cartItemService.getCartItemsByUser(idUser);
        //2 - Verificar Stock
        const results = await Promise.all(
            cartItems.map(async item => ({
                ...item,
                hasStock: await this.productService.verifyStock(item.seller_product_id, item.quantity)
            }))
        );

        //Separar los productos con stock de los que no tienen stock
        const withStock = results.filter(item => item.hasStock);
        //const withoutStock = results.filter(item => !item.hasStock);

        //Continuar con el proceso de compra solo con los productos que tienen stock
        const ticketSaved = await this.repository.checkout(idUser, withStock);

        //Traemos el ticket completo con el detalle de los productos para enviar al mail del usuario
        const fullTicket = await this.ticketService.findTicket(ticketSaved.code);

        //Enviar email al usuario con el detalle de la compra
        await sendEmailPurchase(emailUser, fullTicket);

        return fullTicket;
    }

    //Completar purchase. Sin transacción, sin manejo de errores, sin rollback. Solo para probar la lógica de negocio.
    async purchase(idUser){
        /* 
        1-Obtener cart_items del usuario
        2-Verificar stock por cada producto — los que no tienen stock se separan
        3-Crear registro en carts
        4-Insertar en cart_products los productos que sí tienen stock
        5-Descontar stock en products
        6-Crear registro en purchases vinculando user + cart
        7-Crear el ticket con el monto total
        8-Vaciar cart_items del usuario (solo los que se compraron)
        */

        //1 Obtener los items del carrito del usuario
        const cartItems = await this.cartItemService.getCartItemsByUser(idUser);
        console.log("CartItems:", cartItems);
        //2-Verificar stock por cada producto — los que no tienen stock se separan

        //3-Crear registro en carts y 4-Insertar en cart_products los productos que sí tienen stock
        const newCart = await this.cartService.create(cartItems);
        console.log("Carrito creado: ", newCart);
        //5- Descontar Stock

        //6-Crear registro en purchases vinculando user + cart
        const purchase = await this.repository.create(idUser, newCart);
        console.log("Purchase: ", purchase)
        //7-Crear el ticket con el monto total
        const code = `TICKET-${newCart.date_cart}-${Math.floor(Math.random() * 1000)}-${purchase.id}-${newCart.id}-${idUser}`;
        const newTicket = {
            code: code,
            total: newCart.product.total,
            amount: newCart.product.amount,
            purchase_datetime: newCart.date_cart,
            user_id: idUser,
            cart_id: newCart.id
        }

        const ticket = await this.ticketService.create(newTicket);
        console.log("Ticket: ", ticket);
        //8-Vaciar cart_items del usuario
        await this.cartItemService.removeProductFromCart(idUser);
        return ticket;
    }

}

module.exports = PurchaseService