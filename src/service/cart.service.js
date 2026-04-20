const CartDTO = require('../dto/cart.dto.js');
const { NotFoundException } = require('../exceptions/validation.exception.js');
const CartRepository = require('../repositories/postgreSQL/cart.repository.js');

class CartService{
    constructor(){
        this.repository = new CartRepository();        
    }
    

    /**
     * @inheritdoc
     * @description Obtener todos los carritos
     */
    async findAll(limit = 10, page = 1){
        return await this.repository.findAll(limit, page);
    }

    /**
     * @inheritdoc
     * @description Obtener un carrito por su id
     */
    async findById(cart_id){

        const carts = await this.repository.findById(cart_id);

        if(!carts){
            throw new NotFoundException(`No se encontró el carrito con id ${cart_id}`);
        }

        return carts
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