const Cart = require('../model/carts.model.js')
const BaseService = require('./base.service.js')
const CartDTO = require('../dto/cart.dto.js')
const MongoRepository = require('../repositories/implementations/mongoRepository.js');
const PostgresRepository = require('../repositories/implementations/postgresRepository.js');
const CartRepository = require('../repositories/implementations/cart.repository.js');

class CartService{
    constructor(){
        //mongo
        /* const mongoRepository = new MongoRepository(Cart) */
        //postgres        const PostgresRepository = require('../repositories/implementations/postgresRepository.js')
        this.repository = new CartRepository();        
    }

    async create(cartItems){
        //1 - Crear carrito
        const newCart = await this.repository.create({date_cart: new Date()});
        //2 - Asignar los productos a eso carrito tabla cart_products
        await this.repository.assignProductsToCart(newCart.id, cartItems);
        //3 - contar la cantidad
        newCart.product = await this.repository.sumTotal(newCart.id);

        return newCart;
    }


     /**
     * 
     *Wrapper Pattern
        */

    toFormatDTO(cartData) {
        return new CartDTO(cartData)
    }

    toDTO(cartData) {
        return CartDTO.toResponse(cartData) 
    }

    toManyDTO(carts) {
        return carts.map(cart => CartDTO.toResponse(cart)) 
    }
}

module.exports = CartService