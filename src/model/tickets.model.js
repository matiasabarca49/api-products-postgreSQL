const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    code:{
        type: String,
        required: true
    },
    purchase_datetime:{
        type: String,
        required: true
    },
    amount:{
        type:Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    idCart:{
        type: String,
        required: true                 
    } 
})

const Ticket = mongoose.model("tickets", ticketSchema)

module.exports = Ticket