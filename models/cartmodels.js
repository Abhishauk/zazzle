
const mongoose= require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        subtotal:{
          type: Number,
         }
      },
    ],
    
  },
  { timestamps: true }
);

const cart = mongoose.model("cart", cartSchema);


module.exports = cart
