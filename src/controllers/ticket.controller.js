const TicketService = require('../service/ticket.service')
const ticketService = new TicketService()

const getTicket = async (req, res)=>{
    try{
        const { code } = req.query
        const ticket = await ticketService.findTicket(code)
        
        return res.status(200).send({success: true, data: ticket})
    }
    catch(error){
        console.log(error)
        res.status(500).send({status: "Error", message: error.message})
    }
}

const getTicketByIDCart = async (req,res) =>{
    try{
        const {idCart} = req.query
        const ticketGetted = await ticketService.findTicketByIDCart(idCart)
        ticketGetted
            ? res.status(200).send({status:"Success", ticket: ticketGetted})
            : res.status(500).send({status: "ERROR"})
    }
    catch(error){
        console.log(error)
        res.status(500).send({status: "Error", message: error.message})
    }
}

module.exports = {
    getTicket,
    getTicketByIDCart
}