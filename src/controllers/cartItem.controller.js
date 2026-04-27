const CartItemService = require("../service/cartItem.service");
const cartItemService = new CartItemService();


/*
*Obtener todos los carritos del Usuario
 El usuario tiene que estar logueado
*/
const getCartItemsByUser = async (req, res, next) =>{
    try{
        const cartItems = await cartItemService.getCartItemsByUser(req.session.idUser);
        return res.status(200).json({success: true, data:cartItems});
    }catch(error){
        next(error);
    }
}

/*
* Obtener la cantidad(numero) de productos en el carrito. 
  El usuario tiene que estar logueado
*/
const getCantItemsInCart = async (req, res, next) =>{
    try{

        const cant = await cartItemService.getCantItemsInCart(req.session.idUser);

        return res.status(200).json({success: true, data: cant});
    }catch(error){
        next(error);
    }
}

/*
* Agregar un producto al carrito actual del usuario
 @query {number} product_id - id del producto que se quiere agregar
 @query {number} quantity - cantidad de producto que se quiere agregar
*/
const addProductToCart = async (req, res, next) =>{
    try{
        const {seller_product_id, quantity } = req.body;
        const addedItem = await cartItemService.addProductToCart(req.session.idUser, seller_product_id, quantity);
        return res.status(200).json({success: true, data:addedItem});
    }catch(error){
        next(error);
    }
}

/**
 * Remover un producto del carrito actual del usuario
 * @param {number} seller_product_id id de la oferta a eliminar. id de seller_products(Oferta de vendedor)
 */
const removeProductFromCart = async (req, res, next) =>{
    try{
        const { seller_product_id } = req.params;
        await cartItemService.removeProductFromCart(req.session.idUser, seller_product_id);
        return res.status(200).json({success: true, message: 'Producto eliminado del carrito'});
    }catch(error){
        next(error);
    }
}


module.exports = { 
    getCartItemsByUser,
    getCantItemsInCart,
    addProductToCart,
    removeProductFromCart
}