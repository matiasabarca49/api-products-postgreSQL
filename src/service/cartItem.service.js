const CartItemRepository = require("../repositories/postgreSQL/cartItem.repository");

class CartItemService{
        constructor(){
                this.repository = new CartItemRepository();
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
        async addProductToCart(idUser, product_id, quantity = 1){
                return await this.repository.addProductToCart(idUser, product_id, quantity);
        }

        /**
         * @inheritdoc
         * @description Elimina un item del carrito llamando al repositorio.
        */
        async removeProductFromCart(idUser, product_id){
                return await this.repository.removeProductFromCart(idUser, product_id);
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