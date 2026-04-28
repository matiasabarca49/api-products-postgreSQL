const { NotFoundException } = require("../exceptions/excepciones.js");
const SaleRepository = require("../repositories/postgreSQL/sales.repository");

class SaleService{
    constructor(){
        this.repository = new SaleRepository();
    }

    async findAll(idUser, limit, page){
        return await this.repository.findAll(idUser, limit, page);
    }

    async changeState(ids, status){
        return await this.repository.changeState(ids, status);
    }
}

module.exports = SaleService;
