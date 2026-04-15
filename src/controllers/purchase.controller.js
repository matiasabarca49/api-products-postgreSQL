const PurchaseService = require("../service/purchase.service.js");
const purchaseService = new PurchaseService()

const getPurchasesFromUser = async (req,res)=>{
    try{
        const { limit , page} = req.query;

        const purchases = await purchaseService.getPurchasesByUser(req.session.idUser, limit, page)
        
        return res.status(200).send({success: true, data: purchases})
        
    }catch(err){
        console.log(err)
        return res.status(500).send({ success:false, error: "Error del servidor, intente mas tarde"})
    }
}

const checkout = async (req, res) =>{
    try{
        const purchase = await purchaseService.checkout(req.session.idUser);
        return res.json({success: true, data: purchase})
    }catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: "Error al procesar la compra", error: error.message})
    }

}

module.exports = {
    checkout,
    getPurchasesFromUser
}