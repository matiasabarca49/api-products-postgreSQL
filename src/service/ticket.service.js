const TicketDTO = require('../dto/ticket.dto.js');
const TicketRepository = require('../repositories/implementations/ticket.repository.js');


class TicketService{
    constructor(){
        this.repository = new TicketRepository();
    }

    async findTicket(code){

        const ticket = await this.repository.findTicketByCode(code);
       
        if(!ticket){
            throw new Error("Ticket No encontrado")
        }
        
        return ticket
    }

    async findTicketByIDCart(idCart){
        return await this.findByFilter({idCart: idCart})
    }

    async create(ticketData){
        return await this.repository.create(ticketData)
    }

     /**
     * 
     *Wrapper Pattern
        */

    toFormatDTO(ticketData) {
        return new TicketDTO(ticketData)
    }

    toDTO(ticketData) {
        return TicketDTO.toResponse(ticketData) 
    }

    toManyDTO(tickets) {
        return tickets.map(ticket => TicketDTO.toResponse(ticket)) 
    }

}

module.exports = TicketService