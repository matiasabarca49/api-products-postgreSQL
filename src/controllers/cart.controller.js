const CartService = require('../service/cart.service')
const cartService = new CartService()


/**
 * Obtener todos los carritos
 * Soporta Paginación 
 * @quey {number} limit - cantidad de objetos a devolver
 * @quey {number} page - pagina a devolver
 */
const findAll = async (req, res, next) =>{
    try{

        const { limit = 10 , page = 1 } = req.query;

        const carts = await cartService.findAll(parseInt(limit), parseInt(page));
        
        return res.status(200).json({success: true , data: carts})
        
    }catch(error){
        next(error);
    }
}

/**
 * Obtener cart por id
 * @param {number} cid - Indetificador de Carrito 
 */
const getCartByID = async (req,res, next)=>{
    try{

        const cid  = parseInt(req.params.cid);

        const cart = await cartService.findById(cid);

        return res.status(200).json({success: true, data: cart})
        
    }catch(error){
        next(error);
    }
}

module.exports = {
    findAll,
    getCartByID
}



