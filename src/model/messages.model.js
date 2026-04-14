const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(({
    id:{
        type: String,
        required: true
    },
    autor:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true
    },
    dateMessage:{
        type: String,
        required: true
    }
}))

const Message = mongoose.model("messages", messageSchema )
module.exports = Message
