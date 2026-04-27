const SaleRepository = require("../repositories/postgreSQL/sales.repository");

class SaleService{
    constructor(){
        this.repository = new SaleRepository();
    }

    async findAll(idUser, limit, page){
        return await this.repository.findAll(idUser, limit, page);
    }
}

module.exports = SaleService;
