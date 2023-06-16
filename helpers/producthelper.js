const productSchema = require('../models/productmodels')
const Cart = require('../models/cartmodels')


module.exports={
    decreaseStock: (cartItems) => {
        console.log("wwwwwwwwwwwww");
        console.log(cartItems);
        console.log("099999999999999999990000000000");
        console.log(cartItems.products[0].productId._id)
        return new Promise(async (resolve, reject) => {
           
            // console.log("decreaseStock0",cartItems);
            for (let i = 0; i < cartItems.products.length; i++) {
                let product = await productSchema.findById({ _id: cartItems.products[i].productId._id });
                console.log("rrrrrrrrrrrrrrrrrrr");
                console.log(product);
                // console.log("decreaseStock1",product);
                const isProductAvailableInStock = (product.productQuantity - cartItems.products[i].quantity) >= 0 ? true : false;
                console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
                console.log(isProductAvailableInStock); 
                if (isProductAvailableInStock) {
                    product.productQuantity = product.productQuantity - cartItems.products[i].quantity;
                }
                // else{

                // }
                await product.save();
                // console.log("decreaseStock2",product);
            }
            console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
            resolve(true)
        })
    },
}
