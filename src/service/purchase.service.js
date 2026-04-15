const PurchaseRepository = require("../repositories/implementations/purchase.repository.js");
const CartService = require("./cart.service.js");
const CartItemService = require("./cartItem.service.js");
const ProductsService = require("./products.service.js");
const TicketService = require("./ticket.service.js");

class PurchaseService {
    constructor(){
        this.repository  = new PurchaseRepository();
        this.cartItemService = new CartItemService();
        this.productService = new ProductsService();
        this.cartService = new CartService();
        this.ticketService = new TicketService()
    }

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


    async getPurchasesByUser(idUser, limit = 10, page = 1){
        return this.repository.findAll(idUser, limit, page);
    }

}

module.exports = PurchaseService