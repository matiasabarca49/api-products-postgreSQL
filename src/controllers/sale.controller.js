const SaleService = require("../service/sale.service");
const saleService = new SaleService();

const findAll = async (req, res, next) => {
    try{
        const {limit = 5, page = 1} = req.query;
        const sales = await saleService.findAll(req.session.idUser, limit, page);
        res.json({success: true, data: sales});
    }catch(error){
        next(error);
    }
}

const changeState = async (req, res, next) => {
    try{
        const { ids, status } = req.body;

        const updatedSale = await saleService.changeState( ids, status);

        res.status(200).json({success: true, data: updatedSale});
    }
    catch(error){
        next(error);
    }
}

module.exports = {
    findAll,
    changeState
}