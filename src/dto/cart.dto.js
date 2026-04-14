class CartDTO {
    constructor(cart){
        this.dateCart = cart.dateCart
        this.products = cart.products || []
    }

    static toResponse(cart) {
        return {
            id: cart._id || cart.id,
            dateCart: cart.dateCart,
            products: cart.products
        }
    }
}

module.exports = CartDTO