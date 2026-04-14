class TicketDTO {

    constructor(ticket){
        const date = new Date()
        this.code = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}/${date.getFullYear()}-${ticket.user.id}`
        this.purchase_datetime = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        this.amount = ticket.cart.reduce( (acumulador, product) => acumulador + product.product.price * product.quantity, 0)
        this.purchaser = ticket.user.email
        this.idCart = ticket.idCart
    } 

    static toResponse(ticket) {
        return {
            code: ticket.code,
            purchase_datetime: ticket.purchase_datetime,
            amount: ticket.amount,
            purchaser: ticket.purchaser,
            idCart: ticket.idCart
        }
    }

}

module.exports = TicketDTO