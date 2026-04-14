const CartItemService = require("../service/cartItem.service");
const cartItemService = new CartItemService();


const getCartItemsByUser = async (req, res) =>{
    try{
        const cartItems = await cartItemService.getCartItemsByUser(req.session.idUser);
        return res.json({success: true, data:cartItems});
    }catch(error){
        console.error('Error al obtener los items del carrito:', error);
        return res.status(500).json({success: false, message: 'Error al obtener los items del carrito', error: error.message});
    }
}


const getCartItemById = async (req, res) =>{

}

const getCantItemsInCart = async (req, res) =>{
    try{

        const cant = await cartItemService.getCantItemsInCart(req.session.idUser);

        return res.status(200).json({success: true, data: cant});
    }catch(error){
        console.error(error);
        return res.status(500).json({success: false, error: "Error en el servidor"})
    }
}

const addProductToCart = async (req, res) =>{
    try{
        const {product_id, quantity } = req.body;
        const addedItem = await cartItemService.addProductToCart(req.session.idUser, product_id, quantity);
        return res.json({success: true, data:addedItem});
    }catch(error){
        console.error('Error al agregar el producto al carrito:', error);
        return res.status(500).json({success: false, message: 'Error al agregar el producto al carrito', error: error.message});
    }
}

const removeProductFromCart = async (req, res) =>{
    try{
        const { id } = req.params;
        await cartItemService.removeProductFromCart(req.session.idUser, id);
        return res.json({success: true, message: 'Producto eliminado del carrito'});
    }catch(error){
        console.error('Error al eliminar el producto del carrito:', error);
        return res.status(500).json({success: false, message: 'Error al eliminar el producto del carrito', error: error.message});
    }
}


module.exports = { 
    getCartItemsByUser,
    getCartItemById,
    getCantItemsInCart,
    addProductToCart,
    removeProductFromCart
}