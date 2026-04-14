const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: false
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rol:{
        type: String,
        enum:["User","Premium","Admin"],
        required: true
    },
    documents:[
        {
            name:{
                type: String
            },
            reference:{
                type: String
            }
        }
    ],
    lastConnection:{
        type: String
    },
    purchases:[
            {   
                dateCart:{
                    type: String
                },
                cart:[
                    {
                        product:{
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "products",
                            required: true
                        },
                        quantity:{
                            type: Number,
                            required:true
                        }
                    }
                ]
            } 
    ],
    cart:[
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
                required: true
            },
            quantity:{
                type: Number,
                required:true
            }
        }
    ]
})


//populations
userSchema.pre('find', function(){
    this.populate("purchases.cart.product")
})
userSchema.pre('findOne', function(){
    this.populate("purchases.cart.product")
})
userSchema.pre('find', function(){
    this.populate("cart.product")
})
userSchema.pre('findOne', function(){
    this.populate("cart.product")
})



const User = mongoose.model("users", userSchema)

module.exports = User