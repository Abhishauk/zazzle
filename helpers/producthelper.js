const productSchema = require("../models/productmodels");
const Cart = require("../models/cartmodels");

module.exports = {
  decreaseStock: (cartItems) => {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < cartItems.products.length; i++) {
        let product = await productSchema.findById({
          _id: cartItems.products[i].productId._id
        });
        const isProductAvailableInStock =
          product.productQuantity - cartItems.products[i].quantity >= 0
            ? true
            : false;
        if (isProductAvailableInStock) {
          product.productQuantity =
            product.productQuantity - cartItems.products[i].quantity;
        }
        await product.save();
      }
      resolve(true);
    });
  }
};
