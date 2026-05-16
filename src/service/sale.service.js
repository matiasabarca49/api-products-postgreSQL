const { NotFoundException } = require("../exceptions/excepciones.js");
const SaleRepository = require("../repositories/postgreSQL/sales.repository");

class SaleService{
    constructor(){
        this.repository = new SaleRepository();
    }

    async findAll(idUser, limit, page){
        return await this.repository.findAll(idUser, limit, page);
    }

    /**
     * Actualizar estado de ventas
     * @param {Array} ids - Un array de IDs de ventas a actualizar.
     * @param {String} newState - El nuevo estado a asignar a las ventas.
     * @returns 
     */
    async changeState(ids, status){
        return await this.repository.changeState(ids, status);
    }
}

module.exports = SaleService;
