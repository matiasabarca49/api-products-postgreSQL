class CreateCartItemRequestDTO{
    constructor(cartItem){
        this.seller_product_id = cartItem.seller_product_id;
        this.quantity = cartItem?.quantity || 1;
    }
}

module.exports = {
    CreateCartItemRequestDTO
}