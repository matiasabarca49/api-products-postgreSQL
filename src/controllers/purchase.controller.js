const PurchaseService = require("../service/purchase.service.js");
const purchaseService = new PurchaseService()

const purchase = async (req, res) =>{
    try{
        const purchase = await purchaseService.purchase(req.session.idUser);
        return res.json({success: true, data: purchase})
    }catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: "Error al procesar la compra", error: error.message})
    }

}

module.exports = {
    purchase
}