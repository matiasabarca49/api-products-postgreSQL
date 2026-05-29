const { ForbiddenException } = require("../exceptions/excepciones.js");
const CartItemRepository = require("../repositories/postgreSQL/cartItem.repository");
const ProductService = require("./products.service.js");

class CartItemService{
        constructor(){
                this.repository = new CartItemRepository();
                this.productService = new ProductService();
        }

        /**
         * @inheritdoc
         * @description Obtiene los items del carrito delegando la consulta al repositorio.
        */
        async getCartItemsByUser(idUser){
                return await this.repository.getCartItemsByUser(idUser);
        }

        /**
         * @inheritdoc
         * @description Obtiene la cantidad de items del carrito delegando la consulta al repositorio.
        */
        async getCantItemsInCart(idUser){
                return await this.repository.getCantItemsInCart(idUser);
        }

        /**
         * @inheritdoc
         * @description Agrega un items al carrito delegando la operacion al repositorio.
        */
        async addProductToCart(idUser, cartItem){

                //Validar que el usuario no pueda agregar su propio producto al carrito
                const product = await this.productService.findBySellerProductId(idUser, cartItem.seller_product_id);
                
                //Si existe quiere decir que el producto pertence al usuario, por lo tanto no se puede agregar al carrito
                if(product && product.seller_id === idUser){
                        throw new ForbiddenException("No puedes agregar tu propio producto al carrito");
                }

                return await this.repository.addProductToCart(idUser, cartItem.seller_product_id, cartItem.quantity);
        }

        /**
         * @inheritdoc
         * @description Elimina un item del carrito llamando al repositorio.
        */
        async removeProductFromCart(idUser, seller_product_id){
                return await this.repository.removeProductFromCart(idUser, seller_product_id);
        }

        /**
         * @inheritdoc
         * @description Elimina los items del carrito llamando al repositorio.
        */
        async removeAllProductFromCart(idUser){
                return await this.repository.removeAllProductFromCart(idUser);
        }

}

module.exports = CartItemService;