const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
          },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        orderedItems:[
            {
                productId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'products',
                    required: true,
                },
                quantity:Number
            }
        ],
        // address:mongoose.Schema.Types.ObjectId,
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "address",
            // required: true,
          },
        orderDate:Date,
        coupon:{
            type: String,
            default: null
        },
        totalAmount: Number,
        // finalAmount:Number,
        paymentMethod: String,
        orderStatus: { 
            type:String,
            enum:['pending', 'processing','placed', 'shipped', 'out for delivery' ,'delivered', 'cancelPending' ,'canceled'],
            default:'pending'
        }
    },
    {
        timestamps: true,
    }
);

module.exports = new mongoose.model("Order", orderSchema);