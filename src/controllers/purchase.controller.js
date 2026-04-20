const PurchaseService = require("../service/purchase.service.js");
const purchaseService = new PurchaseService()


/**
 * Obtener las compras del usuario logueado con paginación.
 * Se debe estar logueado para acceder a esta información.
 * @param {limit} [limit=10] - Cantidad de registros por página
 * @param {page} [page=1] - Número de página
 */
const getPurchasesFromUser = async (req,res)=>{
    try{
        const { limit = 10, page = 1} = req.query;

        const purchases = await purchaseService.getPurchasesByUser(req.session.idUser, parseInt(limit), parseInt(page));
        
        return res.status(200).send({success: true, data: purchases})
        
    }catch(err){
        console.log(err)
        return res.status(500).send({ success:false, error: "Error del servidor, intente mas tarde"})
    }
}

/**
 * Realiza el proceso de compra del carrito del usuario.
 * @returns 
 */
const checkout = async (req, res, next) =>{
    try{
        const purchase = await purchaseService.checkout(req.session.idUser);
        return res.json({success: true, data: purchase})
    }catch(error){
        next(error);
    }

}

module.exports = {
    checkout,
    getPurchasesFromUser
}