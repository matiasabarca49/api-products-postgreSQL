const CartItemRepository = require("../repositories/implementations/cartItem.repository");

class CartItemService{
        constructor(){
                this.repository = new CartItemRepository();
        }

        async getCartItemsByUser(idUser){
                return this.repository.getCartItemsByUser(idUser);
        }

        async getCantItemsInCart(idUser){
                return this.repository.getCantItemsInCart(idUser);
        }

        async addProductToCart(idUser, product_id, quantity = 1){
                return this.repository.addProductToCart(idUser, product_id, quantity);
        }

        async removeProductFromCart(idUser, product_id){
                return this.repository.removeProductFromCart(idUser, product_id);
        }

        async removeProductFromCart(idUser){
                return this.repository.removeAllProductFromCart(idUser);
        }

}

module.exports = CartItemService;