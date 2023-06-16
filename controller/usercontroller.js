const { response } = require("express");
const userhelper = require("../helpers/userhelper");
const category = require("../models/categorymodels");
const user = require("../models/usermodels");
const product = require("../models/productmodels");
const cart = require("../models/cartmodels");
const orderModel = require("../models/ordermodels");
const wishlistModel = require("../models/wishlistmodel");
const addressModal = require("../models/addressmodels");
const wallet = require("../models/walletmodels");
const orderHepler = require("../helpers/orderhelper");
const couponhelper = require("../helpers/couponhelper");
const wishlisthelper = require("../helpers/wishlisthelper");
const producthelper = require("../helpers/producthelper");
const wallethelper = require("../helpers/wallethelper");
const ObjectId = require("mongoose").Types.ObjectId;
const Razorpay = require("razorpay");

const key_id=process.env.key_id;
const key_secret=process.env.key_secret;

var instance = new Razorpay({
  key_id,
  key_secret
});

const dotenv = require("dotenv");
const {
  FeedbackListInstance
} = require("twilio/lib/rest/api/v2010/account/message/feedback");
const orderhelper = require("../helpers/orderhelper");
const { log } = require("util");
const couponmodels = require("../models/couponmodels");
const categorycontroller = require("./categorycontroller");
const { categories } = require("./admincontroller");
dotenv.config();
module.exports = {
  home: async (req, res, next) => {
    try {
      console.log(req.session.user);
      let username = req.session.userid.username;
      let userId = req.session.userid._id;
      let products = await product.find();
      console.log(products);
      wishListCount = await wishlisthelper.getWishListCount(userId);
      cartCount = await userhelper.getCartCount(userId);
      console.log(wishListCount);
      res.render("shop/home.ejs", {
        username,
        products,
        wishListCount,
        cartCount
      });
    } catch (err) {
      console.error(err);
    }
  },
  landingpage: async (req, res) => {
    try {
      let products = await product.find();
      console.log(products);
      res.render("shop/home.ejs", { products });
    } catch (error) {
      console.error(error);
    }
  },
  usercontact: async (req, res) => {
    try {
      
      if (req.session.user) {
        var userId = req.session.userid._id;
        var username = req.session.userid.username || null;
      }
      wishListCount = await wishlisthelper.getWishListCount(userId);
      cartCount = await userhelper.getCartCount(userId);
      res.render("shop/contact.ejs", { username, wishListCount, cartCount });
    } catch (err) {
      console.error(err);
    }
  },
  userlogin: function(req, res) {
    try {
      res.render("shop/userlogin.ejs");
    } catch (err) {
      console.error(err);
    }
  },
  usersignup: function(req, res) {
    try {
      res.render("shop/usersign-up.ejs");
    } catch (err) {
      console.error(err);
    }
  },
  signuppost: function(req, res) {
    try {
      userhelper.dosignup(req.body).then(response => {
        let msg = "user already exist";
        if (response.status) {
          res.render("shop/usersign-up.ejs", { msg });
        } else {
          req.session.user = true;
          req.session.userid = response.user;
          res.redirect("/");
        }
      });
    } catch (err) {
      console.error(err);
    }
  },
  loginpost: (req, res) => {
    try {
      userhelper.doLogin(req.body).then(function(response) {
        if (response.status) {
          if (response.user.block == true) {
            let msg = "block user";
            res.render("shop/userlogin", { msg });
            console.log(msg);
          } else {
            req.session.user = true;
            req.session.userid = response.user;
            res.redirect("/");
          }
        } else {
          let msg = response.msg;

          res.render("shop/userlogin.ejs", { msg });
        }
      });
    } catch (err) {
      console.error(err);
    }
  },
  userlogout: function(req, res) {
    req.session.user = false;
    res.redirect("/");
  },
  userblog: function(req, res) {
    try {
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      res.render("shop/blog.ejs", { username });
    } catch (err) {
      console.error(err);
    }
  },
  usershop: async (req, res) => {
    try {
      const count = parseInt(req.query.count) || 6;
      const page = parseInt(req.query.page) || 1;
      const totalCount = await product.countDocuments();
      const startIndex = (page - 1) * count;
      const totalPages = Math.ceil(totalCount / count);

      // Generate a random offset based on the total count and the page size
      const randomOffset = Math.floor(Math.random() * (totalCount - count));
      const endIndex = Math.min(count, totalCount - startIndex);
      const pagination = {
        totalCount: totalCount, // change this to `totalCount` instead of `totalProductsCount`
        totalPages: totalPages,
        page: page,
        count: count,
        startIndex: startIndex,
        endIndex: endIndex
      };

      const products = req.query.array ? JSON.parse(req.query.array) : null;
      console.log(products);
      if (req.session.user) {
        var userId = req.session.userid._id;
        var wishListCount = await wishlisthelper.getWishListCount(userId);
        var cartCount = await userhelper.getCartCount(userId);
        console.log(wishListCount);
        var username = req.session.userid.username || null;
      }

      if (products) {
        let categories = await category.find();
        res.render("shop/shop.ejs", {
          products,
          categories,
          username,
          pagination,
          wishListCount,
          cartCount
        });
      } else {
        let products = await product
          .find({ productdeactive: { $eq: false } })
          .skip(startIndex)
          .limit(count)
          .lean();
        let categories = await category.find();
        res.render("shop/shop.ejs", {
          products,
          categories,
          username,
          pagination,
          wishListCount,
          cartCount
        });
      }
    } catch (err) {
      console.error(err);
    }
  },
  OTPlogin: function(req, res) {
    try {
      res.render("shop/login-OTP");
    } catch (err) {
      console.error(err);
    }
  },
  checkOTP: function(req, res) {
    console.log("lmlmlmlmlml");
    userhelper.checkOTP(req.body).then(response => {
      if (response.status) {
        let phonenumber = response.validUser.phonenumber;
        res.render("shop/verifyOTP", { phonenumber });
      } else {
        console.log(response.msg2);
        let msg = response.msg;
        res.render("shop/login-OTP", { msg });
      }
    });
  },
  checkOTPforgot: function(req, res) {
    userhelper.checkOTPforgot(req.body).then(response => {
      if (response.status) {
        let phonenumber = response.validUser.phonenumber;
        res.render("shop/verifyOTPforgot", { phonenumber });
      } else {
        console.log(response.msg2);
        let msg = response.msg;
        res.render("shop/forgotpassword", { msg });
      }
    });
  },
  productdetails: async (req, res) => {
    try {
      console.log(req.params.id);
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      userhelper.productdetailes(req.params.id).then(response => {
        console.log(response);
        res.render("shop/product-details.ejs", { response, username });
      });
    } catch (error) {}
  },
  forgotpassword: async (req, res) => {
    try {
      res.render("shop/forgotpass.ejs");
    } catch (error) {}
  },
  resetpasspost: async (req, res) => {
    try {
      let userid = req.params.id;
      userhelper.resetpasspost(req.body, userid).then(response => {
        res.redirect("/login");
      });
    } catch (error) {}
  },
  shopcart: async function(req, res) {
    try {
      let product;
      const user = req.session.userid;
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      console.log(user);

      const Cart = await cart
        .findOne({ user: user })
        .populate("products.productId");
      if (Cart) {
        product = Cart.products;
      }
      let total = await userhelper.getCartTotal(user);
      var userId = req.session.userid._id;
      var wishListCount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
      res.render("shop/shop-cart.ejs", {
        user,
        product,
        Cart,
        total,
        username,
        wishListCount,
        cartCount
      });
    } catch (err) {
      console.error(err);
    }
  },
  addToCart: async (req, res) => {
    try {
      console.log(req.body);
      let userid = req.session.userid;
      userhelper.addToCart(userid, req.body).then(response => {
        console.log(response);
        res.json(response);
      });
    } catch (error) {}
  },
  removecartitem: async (req, res) => {
    let productId = req.params.id;
    console.log(productId);
    let userId = req.session.userid;
    try {
      const response = await userhelper.removecartitem(userId, productId);
      if (response.status) {
        res.redirect("/shop-cart");
        res.json({ success: true, message: response.message });
      } else {
        res.json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
    }
  },
  changeQuantity: async (req, res, next) => {
    console.log(req.body);
    let userid = req.session.userid;
    userhelper.changeProductQuantity(req.body).then(async response => {
      await userhelper.getCartTotal(userid).then(total => {
        res.json({ response: response, total: total });
      });
    });
  },
  // checkout: async (req, res) => {
  //   try {
  //     let userid=req.session.userid;
  //     await userhelper.getCartTotal(userid).then((total)=>{
  //     res.render('shop/checkout',{total})
  //   })

  //   } catch (error) {

  //   }
  // }
  checkout: async (req, res) => {
    console.log("plplpl");
    let cartId = req.params.id;
    let user = req.session.userid;
    if (req.session.user) {
      var username = req.session.userid.username || null;
    }
    const Cart = await cart
      .findOne({ user: user })
      .populate("products.productId");
    let total = await userhelper.getCartTotal(user);

    console.log(total);
    console.log(cart);
    console.log(user);
    let addresses = await addressModal.find({ user: req.session.userid._id });
    console.log(addresses);

    // const address = await addressModal
    //   .findOne({ user: user })
    //   .populate("address._id");
    // const addresses = address ? address.address : [];
    var userId = req.session.userid._id;
    var wishListCount = await wishlisthelper.getWishListCount(userId);
    var cartCount = await userhelper.getCartCount(userId);
    console.log(wishListCount);
    let walletBalance = await wallethelper.walletBalance(userId)
        walletBalance = currencyFormat(walletBalance);
        console.log("8888");
        console.log(walletBalance);
    let coupon = await couponmodels.find();
    res.render("shop/checkout.ejs", {
      user,
      Cart,
      total,
      addresses,
      username,
      wishListCount,
      cartCount,
      coupon,
      walletBalance
    });
  },
  addAddress: async (req, res) => {
    console.log(req.body);
    let userId = req.session.userid._id;
    userhelper.addAddress(req.body, userId).then(response => {
      res.status(202).json({ response });
    });
  },
  //   placeOrder:async(req,res)=>{
  //     try {
  //         let userId=req.session.userid._id
  //         let total=await userhelper.getCartTotal(userId)
  //         userhelper. placeOrder(req.body,userId,total).then(response=>{
  //             console.log(req.body);
  //             res.json(response)
  //         })
  //     } catch (error) {
  //
  //     }
  //
  //   },
  placeOrder: async (req, res) => {
    try {
      console.log(req.body);
      let userId = req.session.userid._id;
      console.log(req.body.address_id);
      console.log(req.body.payment_method);
      const cartItems = await cart
        .findOne({ user: userId })
        .populate("products.productId");
      // let coupon=await couponSchema.find({user:userId})
      console.log(cartItems.products[0]);
      console.log(cartItems);
      if (!cartItems.products.length) {
        return res.json({
          error: true,
          message: "Please add items to cart before checkout"
        });
      }

      if (req.body.address_id == undefined) {
        return res.json({ error: true, message: "Please Choose Address" });
      }
      if (req.body.payment_method == undefined) {
        return res.json({
          error: true,
          message: "Please Choose Payment Method"
        });
      }

      // const totalAmount = await cartHelper.totalAmount(userId); // instead find cart using user id and take total amound from that
      let totalAmount = req.body.total;
      console.log(totalAmount, "totalAmount");

      console.log(userId, "userId");

      console.log(cartItems);
      console.log(req.body);
      console.log(userId);
      console.log(req.body.payment_method);
      console.log(req.body.address_id);

      const orderId = await orderHepler.orderPlacing(
        req.body,
        totalAmount,
        cartItems,
        userId
      );

      console.log("555");
      console.log(orderId);
      await producthelper.decreaseStock(cartItems);
      if (req.body.payment_method == "COD") {
        res.status(202).json({ status: true, orderId: orderId });
      }
      else if (req.body.payment_method == 'wallet') {
        let isPaymentDone = await wallethelper.payUsingWallet(userId, totalAmount);
        if (isPaymentDone) {

           await orderModel.findOneAndUpdate(
            { _id: orderId },
            {
              $set: { 
                orderStatus: "placed"
              }
            })
          // await producthelper.decreaseStock(cartItems);
          console.log("vannu");
          console.log(orderId);
          res.status(202).json({status:true, orderId:orderId})
        }
         else {
            res.status(200).json({ payment_method: 'wallet', error: true, msg: "Insufficient Balance in wallet" })
        }
      }
       else {
        await userhelper
          .generaterazorpay(orderId, totalAmount)
          .then(response => {
            console.log("++++++++", response);
            res.status(202).json({ response, status: false });
          });
      }
      
    } catch (error) {
      console.log(error);
    }
  },

  ordersuccess: async (req, res) => {
    try {
      const user = req.session.userid;
      const userId = req.session.userid._id;
      const orderId = req.query.id;
      console.log("++++");

      console.log(orderId);
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      const order = await orderModel.findById(orderId);
      let orders = await orderhelper.getOrderedProductsDetails(orderId);
      // let product;
      // const Cart = await cart
      //   .findOne({ user: user })
      //   .populate("products.productId");

      // if (Cart) {
      //   product = Cart.products;
      // }
      console.log(orders);
      let total = order.totalAmount;

      await userhelper.clearCart(userId);
      var wishListCount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
      console.log(wishListCount);
      res.render("shop/ordersuccess.ejs", {
        orders,
        username,
        total,
        cartCount,
        wishListCount
      });
    } catch (error) {}
  },

  orderlist: async (req, res) => {
    try {
      let userId = req.session.userid._id;
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      const orders = await orderhelper.getAllOrderDetailsOfAUser(userId);
      var wishListCount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
      console.log(wishListCount);
      res.render("shop/order-list.ejs", {
        orders,
        username,
        cartCount,
        wishListCount
      });
    } catch (error) {}
  },

  orderdetailes: async (req, res) => {
    try {
      let orderid = req.params.id;
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }

      let orderaddress = await orderHepler.getOrderedUserDetailsAndAddress(
        orderid
      );
      let orderdetailes = await orderHepler.getOrderedProductsDetails(orderid);
      console.log(orderaddress);
      console.log(orderaddress.address.address);
      console.log(orderdetailes);
      let addresses = await addressModal.find({ user: req.session.userid._id });
      console.log(addresses);
      var userId = req.session.userid._id;
      var wishListCount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
      console.log(wishListCount);
      res.render("shop/order-detailes.ejs", {
        orderdetailes,
        addresses,
        orderid,
        username,
        cartCount,
        wishListCount
      });
    } catch (error) {}
  },

  veryfyPayment: async (req, res) => {
    try {
      console.log("verify");
      console.log(req.body);
      try {
        let details = req.body;

        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", "nvm1ozXmKUEnyqNOjDJCMY80");
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        let orderResponse = details["order[response][receipt]"];
        console.log("kjlk", orderResponse);
        let orderObjId = new ObjectId(orderResponse);
        console.log("obj:", orderObjId);
        if (hmac === details["payment[razorpay_signature]"]) {
          await orderModel.updateOne(
            { _id: orderObjId },
            {
              $set: {
                orderStatus: "placed"
              }
            }
          );

          console.log("Payment is successful");
          res.json({ status: true, orderId: orderObjId });
        } else {
          await orderModel.updateOne(
            { _id: orderObjId },
            {
              $set: {
                orderStatus: "failed"
              }
            }
          );
          console.log("Payment is failed");
          res.json({ status: false, errMsg: "" });
        }
      } catch (error) {
        console.log(error, "error");
        res.status(500).send("Internal server error");
      }
    } catch (error) {}
  },
  paymentfailed: async (req, res) => {
    try {
      res.render("shop/success.ejs");
    } catch (error) {}
  },
  profile: async (req, res) => {
    try {
      let userId = req.session.userid._id;
      let user = req.session.userid;
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      console.log(userId);
      const orders = await orderhelper.getAllOrderDetailsOfAUser(userId);
      console.log(orders);
      let address = await addressModal.find({ user: req.session.userid._id });
      console.log(address);

      // console.log(orders[0].paymentMethod);
      // console.log(orders[0].orderedItems[0]);
      // console.log(orders[0].addressLookedup[0].address[0].name);

      var wishListCount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
      console.log(wishListCount);
      let walletBalance = await wallethelper.walletBalance(userId)
      walletBalance = currencyFormat(walletBalance);
      console.log("wallet",walletBalance);

      res.render("shop/profile.ejs", {
        orders,
        username,
        address,
        cartCount,
        wishListCount,
        user,
        walletBalance
      });
    } catch (error) {}
  },
  cancelOrder:async(req,res)=>{ 
    try {
      let orderId=req.params.id
      let userId=req.session.userid._id
      console.log("anamaamana");
      console.log(orderId);
     const cancelledResponse= await orderModel.findOneAndUpdate(
        { _id: orderId },
        {
          $set: { 
            orderStatus: "Cancelled"
          }
        })
        console.log("mmmmmmmmm",cancelledResponse); 

        if(cancelledResponse.paymentMethod!='COD'){
          await wallethelper.addMoneyToWallet(userId,cancelledResponse.totalAmount);
        }
        res.json({status:true})
      

         
    } catch (error) {
        
    }
 },
 ReturnOrder:async(req,res)=>{
  try {
      let orderId=req.params.id
      let userId=req.session.userid._id
      console.log("anamaamana");
      console.log(orderId);

      const returnResponse= await orderModel.findOneAndUpdate(
        { _id: orderId },
        {
          $set: {
            orderStatus: "Return"
          }
        })

        if(returnResponse.paymentMethod!='COD'){
          await wallethelper.addMoneyToWallet(userId,returnResponse.totalAmount);
        }

        res.json({status:true})
    

         
    } catch (error) {
        
    }
},
  // Import the required modules

  // Add the search route
  search: async (req, res) => {
    try {
      const query = req.query.query;
      console.log(query);
      // Perform the search query using the provided search term
      const products = await product
        .find({ productname: { $regex: new RegExp("^" + query, "i") } })
        .lean();
      console.log(products);
      res.redirect(
        "/shop?array=" + encodeURIComponent(JSON.stringify(products))
      );
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  // applyCoupon: async (req, res) => {
  //   try {
  //     const user = req.session.userid;
  //     console.log(user);
  //     const { totalAmount, couponCode } = req.body;
  //     console.log(couponCode);
  //     console.log(totalAmount);
  //     console.log(totalAmount);
  //     const response = await couponhelper.applyCoupon(
  //       user._id,
  //       couponCode,
  //       totalAmount
  //     );

  //     console.log(response);
  //     res.json(response);
  //   } catch (error) {}
  // },

  applyCoupon :async (req, res) => {
    try {
        if(req.body.totalAmount <500){
          res.json({ status: false, message: "Coupon available only for the 500₹ abouve purchase" })
        }
        const user = req.session.userid
        console.log(user);
        const { totalAmount, couponCode } = req.body;
  
        const response = await couponhelper.applyCoupon(user._id, couponCode,totalAmount);
  
        res.json(response);
  
    } catch (error) {
  
    }
  },
  wishlist: async (req, res) => {
    try {
      let userId = req.session.userid._id;
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      console.log(userId);
      let wishList = await wishlisthelper.getAllWishListItems(userId);
      var wishListCount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
      console.log(wishListCount);
      console.log("wiaashlist items");
      console.log(wishList);
      console.log("wiaashlist items");
     
      res.render("shop/wishlist.ejs", {
        wishList,
        username,
        cartCount,
        wishListCount,
       
      });
    } catch (error) {
      res.redirect("404");
    }
  },
  addToWishList: async (req, res) => {
    try {
      let productId = req.body.productId;
      let user = req.session.userid._id;

      console.log("productId ", productId);
      console.log("user ", user);

      let response = await wishlisthelper.addItemToWishList(productId, user);

      res.json(response);
    } catch (error) {
      console.log(error);
    }
  },
  removeFromWishList: async (req, res) => {
    try {
      let userId = req.session.userid._id;
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      let productId = req.params.id;
      console.log(productId);
      await wishlisthelper.removeAnItemFromWishList(userId, productId);
      wishListCount = await wishlisthelper.getWishListCount(userId);

      console.log(wishListCount);
      // res.status(200).json({message:"product removed from wishList",wishListCount})
      if (response.status) {
        res.json({ success: true, message: response.message });
      } else {
        res.json({ success: false, message: response.message });
      }
    } catch (error) {}
  },
  deleteaddress: async (req, res) => {
    try {
      let addressid = req.params.id;
      console.log(addressid);
      userhelper.deleteaddress(addressid).then(response => {
        res.json(response);
      });
    } catch (error) {}
  },
  editaddress: async (req, res) => {
    try {
    } catch (error) {}
  },
  filter: async (req, res) => {
    try {
      console.log("jjjjjjjj");
      console.log(req.body);
  
      // Retrieve the filter values from the request body
      var selectedCategories = req.body["categories[]"];
      var selectedPriceRanges = req.body["priceRanges[]"];
      var selectedColors = req.body["colors[]"];
  
      console.log(selectedCategories);
      console.log(selectedPriceRanges);
      console.log(selectedColors);
  
      // Construct the filter query based on the selected values
      var filterQuery = {};
  
      if (selectedCategories && selectedCategories !=="") {
        filterQuery.productcategory = { $in: selectedCategories };
      }
  
      if (selectedPriceRanges && selectedPriceRanges !=="") {
        let [minPrice, maxPrice] = selectedPriceRanges.split("-");
        filterQuery.productpromotionalprice = {
          $gte: parseInt(minPrice),
          $lte: parseInt(maxPrice)
        };
      }
      
 
  
      if (selectedColors && selectedColors !=="") {
        filterQuery.productColor = { $in: selectedColors };
      }
  
      // Find the filtered products from the database
      var filteredProducts = await product.find(filterQuery);
  
      console.log(filteredProducts);
  
      // Return the filtered results as JSON
      res.json(filteredProducts);
     
    } catch (error) {
      console.log('Error occurred while filtering results:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
}
function currencyFormat(amount) {
  return Number(amount).toLocaleString('en-in', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
}
