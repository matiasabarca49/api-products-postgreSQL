const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    dateCart:{
        type: String,
        required: true
    },
    products:{
        type:[
            {
                product:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        required: true
    }
})


//populations
cartSchema.pre('find', function(){
    this.populate("products.product")
})
cartSchema.pre('findOne', function(){
    this.populate("products.product")
})

const Cart = mongoose.model("carts", cartSchema)
module.exports = Cart