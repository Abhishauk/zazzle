const mongoose = require("mongoose");
const user = require("../models/usermodels");
const twilioFunctions = require("../config/twilio");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const session = require("express-session");
const usercontroller = require("../controller/usercontroller");
const { response } = require("../app");
const product = require("../models/productmodels");
const cart = require("../models/cartmodels");
const orderModel = require("../models/ordermodels");
const addressModal = require("../models/addressmodels");
const ObjectId = require("mongoose").Types.ObjectId;
const Razorpay = require("razorpay");

const key_id = process.env.key_id;
const key_secret = process.env.key_secret;

var instance = new Razorpay({
  key_id,
  key_secret
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);


dotenv.config();
module.exports = {
  dosignup: function (body) {
    return new Promise(function (resolve, reject) {
      try {
        user.findOne({ email: body.email }).then((oldUser, err) => {
          if (err) {
            reject(err);
          } else {
            if (oldUser) {
              resolve({ status: true, user: null });
            } else {
              var saltRounds = 10;
              var password = body.password.toString();
              bcrypt.hash(
                password,
                saltRounds,
                async function (err, newpassword) {
                  if (err) {
                    reject(err);
                  } else {
                    var newUser = new user({
                      username: body.username,
                      email: body.email,
                      password: newpassword,
                      phonenumber: body.phonenumber,
                      status: false
                    });
                    var savedUser = await newUser.save();
                    resolve({ status: false, user: savedUser });
                  }
                }
              );
            }
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  doLogin: function (body) {
    return new Promise((resolve, reject) => {
      try {
        user.findOne({ email: body.email }).then((validUser, err) => {
          if (err) {
            reject(err);
          } else {
            if (validUser) {
              // if (true) {
              bcrypt
                .compare(body.password, validUser.password)
                .then((isPasswordMatch, err) => {
                  if (err) {
                    reject(err);
                  } else {
                    if (isPasswordMatch) {
                      resolve({ status: true, user: validUser });
                    } else {
                      let msg = "Incorrect password";
                      resolve({ status: false, msg });
                    }
                  }
                });
            } else {
              let msg = "Email does not exist";
              resolve({ status: false, msg });
            }
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  checkOTP: function (body) {
    return new Promise(function (resolve, reject) {
      try {
        user
          .findOne({ phonenumber: body.phonenumber })
          .then((validUser, err) => {
            if (err) {
              reject(err);
            } else {
              if (validUser) {
                twilioFunctions.generateOTP(validUser.phonenumber);
                const msg1 = "OTP SENT!!";
                resolve({ status: true, validUser, msg1 });
              } else {
                let msg2 = "user not registered";
                resolve({ status: false, msg2 });
              }
            }
          });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  checkOTPforgot: function (body) {
    return new Promise(function (resolve, reject) {
      try {
        user
          .findOne({ phonenumber: body.phonenumber })
          .then((validUser, err) => {
            if (err) {
              reject(err);
            } else {
              if (validUser) {
                twilioFunctions.generateOTP(validUser.phonenumber);
                const msg1 = "OTP SENT!!";
                resolve({ status: true, validUser, msg1 });
              } else {
                let msg2 = "user not registered";
                resolve({ status: false, msg2 });
              }
            }
          });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  verifyOTP: async (req, res) => {
    console.log("aaa");
    const otp =
      req.body.otp1 +
      req.body.otp2 +
      req.body.otp3 +
      req.body.otp4 +
      req.body.otp5;
    const phonenumber = req.body.phone;
    try {
      console.log("aafxc");
     
      client.verify.v2
        .services(`VAcf98a49832344e18ee4a4d7842816268`)
        .verificationChecks.create({
          to: `+91${phonenumber}`,
          code: otp
        })
        .then(async (verificationChecks) => {
          if (verificationChecks.status === "approved") {
            let user1 = await user.findOne({ phonenumber: phonenumber });
            console.log(
              `User ${user1._id} logged in with phone number ${phonenumber}`
            );
            console.log("aa");
            req.session.user = true;
            req.session.userid = user1;
            res.redirect("/");
          } else {
            let msg = "Incorrect OTP!!!";
            res.render("shop/verifyOTP", { msg, phonenumber });
          }
        });
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: error.message
      });
    }
  },
  verifyOTPforgot: async (req, res) => {
    const otp =
      req.body.otp1 +
      req.body.otp2 +
      req.body.otp3 +
      req.body.otp4 +
      req.body.otp5;
    const phonenumber = req.body.phone;
    try {
      client.verify.v2
        .services(`VAcf98a49832344e18ee4a4d7842816268`)
        .verificationChecks.create({
          to: `+91${phonenumber}`,
          code: otp
        })
        .then(async (verificationChecks) => {
          if (verificationChecks.status === "approved") {
            let user1 = await user.findOne({ phonenumber: phonenumber });
            console.log(
              `User ${user1._id} logged in with phone number ${phonenumber}`
            );
            res.render("shop/resetpassword.ejs", { user1 });
          } else {
            let msg = "Incorrect OTP!!!";
            res.render("shop/verifyOTPforgot", { msg, phonenumber });
          }
        });
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: error.message
      });
    }
  },
  resetpasspost: async (body, userid) => {
    try {
      var saltRounds = 10;
      var password = body.password.toString();
      bcrypt.hash(password, saltRounds, async function (err, newpassword) {
        if (err) {
          reject(err);
        } else {
          let userdata = await user.findById(userid);
          userdata.password = newpassword;
          await userdata.save();
        }
      });

      // Log success message
      console.log("Password updated successfully");
    } catch (error) {
      // Log error message
      console.error("Error updating password:", error);
    }
  },

  addToCart: async (userId, body) => {
    try {
      if (!userId) {
        return { response: false };
      }
      let productId = body.productid;
      const productdetail = await product.findById(productId);
      if (!productdetail) {
        throw new Error("Product not found");
      }

      const quantity = productdetail.productQuantity;

      if (quantity < 1) {
        return { response: true, limit: true, msg: "Product out of stock" };
      }

      let added;
      const cartuser = await cart.findOne({ user: userId });
      if (cartuser) {
        added = await cart.updateOne(
          { user: userId, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
      }

      const Cart = await cart.findOneAndUpdate(
        { user: userId, "products.productId": { $ne: productId } },
        { $push: { products: { productId, quantity: 1 } } },
        { new: true }
      );
      if (!Cart && !added) {
        await cart.updateOne(
          { user: userId },
          { $push: { products: { productId, quantity: 1 } } },
          { upsert: true }
        );
        throw new Error("Could not update cart");
      }

      return { response: true };
    } catch (error) {
      console.error(error);
    }
  },
  getCartTotal: async (userId) => {
    try {
      const Cart = await cart
        .findOne({ user: userId })
        .populate("products.productId");
      if (!Cart) {
        return { status: false, message: "cart not found" };
      }
      let total = 0;
      Cart.products.forEach((item) => {
        total += item.productId.productpromotionalprice * item.quantity;
      });
      total = parseInt(total);
      return total;
    } catch (error) {
      console.error(error);
      return { status: false, message: "cart not found" };
    }
  },
  removecartitem: async (userId, productId) => {
    try {
      const userProduct = await product.findById(productId);
      if (!userProduct) {
        return { status: false, message: "product not found" };
      }

      const Cart = await cart.findOne({ user: userId });
      if (Cart) {
        const itemIndex = Cart.products.findIndex((item) =>
          item.productId.equals(productId)
        );
        if (itemIndex > -1) {
          Cart.products.splice(itemIndex, 1);
          await Cart.save();
          return { status: true, message: "product removed from cart" };
        } else {
          return { status: false, message: "product not found in cart" };
        }
      } else {
        return { status: false, message: "cart not found" };
      }
    } catch (error) {
      console.error(error);
    }
  },
  productdetailes: async (body) => {
    try {
      let Productid = body;
      let productdetailes = await product.findById(Productid);
      return productdetailes;
    } catch (error) {
      console.error(error);
    }
  },
  changeProductQuantity: async (body) => {
    try {
      body.count = parseInt(body.count);
      body.quantity = parseInt(body.quantity);
      const productId = body.product;
      const cartId = body.cart;
      const count = body.count;
      let Product = await product.findById(productId);
      productQuantity = Product.productQuantity;
      return new Promise((resolve, reject) => {
        if (body.count == -1 && body.quantity == 1) {
          cart
            .updateOne(
              { _id: cartId },
              { $pull: { products: { productId: productId } } }
            )
            .then((response) => {
              resolve({ response: response, remove: true });
            });
        } else if (productQuantity == body.quantity && body.count == 1) {
          resolve({ response: response, limit: true });
        } else {
          cart
            .updateOne(
              { _id: cartId, "products.productId": productId },
              { $inc: { "products.$.quantity": count } }
            )
            .then((response) => {
              resolve(false);
            });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  addAddress: async (body, userId) => {
    await addressModal.create({
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      postcode: body.postcode,
      phone: body.phonenumber,
      email: body.email,
      user: userId
    }),
      { upsert: true };

    return { status: true };
  },
  placeOrder: async (body, userId, total) => {
    let addressId = body.address_id;
    const Cart = await cart
      .findOne({ user: userId })
      .populate("products.productId");
    const adrs = await addressModal.aggregate([
      {
        $match: { user: new ObjectId(userId) }
      },
      {
        $unwind: "$address"
      },
      {
        $match: { "address._id": new ObjectId(addressId) }
      }
    ]);
    let orderstatus = body.payment_method == "COD" ? "confirmed" : "pending";
    await orderModel.updateOne(
      { user: userId },
      {
        shippingAddress: {
          name: adrs[0].address.name,
          address: adrs[0].address.address,
          city: adrs[0].address.city,
          state: adrs[0].address.state,
          phone: adrs[0].address.phonenumber
        },
        items: Cart.products,
        payment_method: body.payment_method,
        total: total,
        status: orderstatus
      }
    );
    return { status: true };
  },
  clearCart: async (userId) => {
    await cart.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true }
    );
  },
  generaterazorpay: async (orderId, totalAmount) => {
    try {
      var options = {
        amount: totalAmount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId
      };
      const order = await instance.orders.create(options);
      return order;
    } catch (error) {}
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let Cart = await cart.findOne({ user: userId });
      if (Cart) {
        var cartCount = Cart.products.length;
      }
      resolve(cartCount);
    });
  },
  deleteaddress: async (body) => {
    try {
      let addressid = body;
      let address = await addressModal.findById(addressid);
      address.status = false;
      address.save();
      return { status: true };
    } catch (error) {}
  }
};
