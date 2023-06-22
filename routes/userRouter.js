 var express = require('express');
 var router = express.Router();
/* GET home page. */
const usercontroller= require('../controller/usercontroller');
const userhelper = require('../helpers/userhelper');
const validatehelper = require("../helpers/validatehelper");
const {userauthentication,userCheck} = require('../middleware/session')


router.get('/',userauthentication,usercontroller.landingpage)
router.get('/home',userCheck, usercontroller.home)
router.get('/login',userauthentication,usercontroller.userlogin)
router.get('/login-OTP',userauthentication,usercontroller.OTPlogin)
router.get('/signup',userauthentication,usercontroller.usersignup)
router.get('/contact',usercontroller.usercontact)
router.get('/blog',usercontroller.userblog)
router.get('/shop',usercontroller.usershop)
router.get('/logout',usercontroller.userlogout)
router.get('/product-details/:id',usercontroller.productdetails)
router.get('/forgotpassword',userauthentication,usercontroller.forgotpassword)
router.get('/shop-cart',userCheck,usercontroller.shopcart)
router.get('/checkout',userCheck,usercontroller.checkout)
router.get('/ordersuccess',usercontroller.ordersuccess)
router.get('/order-list',usercontroller.orderlist)
router.get('/order-detailes/:id',usercontroller.orderdetailes)
router.get('/profile',usercontroller.profile)
router.get('/wishlist',userCheck,usercontroller.wishlist);


router.post('/signup',usercontroller.signuppost)
router.post('/login',usercontroller.loginpost)
router.post('/productSearch',usercontroller.productSearch)
router.post('/verifyotpSignup',validatehelper.verifyOTPSignup )
router.post('/checkOTP',usercontroller.checkOTP)
router.post('/checkOTPforgot',usercontroller.checkOTPforgot)
router.post('/verifyotp',userauthentication,userhelper.verifyOTP)
router.post('/verifyotpforgot',userauthentication,userhelper.verifyOTPforgot)
router.post('/resetpasspost/:id',userauthentication,usercontroller.resetpasspost)
router.post('/addToCart',userCheck,usercontroller.addToCart)
router.post('/changeQuantity',usercontroller.changeQuantity)
router.post('/addAddress',usercontroller.addAddress)
router.post('/placeOrder',usercontroller.placeOrder)
router.post('/verify-payment',usercontroller.veryfyPayment)
router.post('/apply-coupon',usercontroller.applyCoupon)
router.post('/add-to-wishList',userCheck,usercontroller.addToWishList);
router.post('/filter-results',usercontroller.filter)


router.put('/removecartitem/:id',usercontroller.removecartitem)
router.put('/cancelOrder/:id',userCheck,usercontroller.cancelOrder)
router.put('/ReturnOrder/:id',userCheck,usercontroller.ReturnOrder)
router.put('/remove-from-wishList/:id',userCheck,usercontroller.removeFromWishList)
router.put('/deleteaddress/:id',userCheck,usercontroller.deleteaddress)
router.put('/editaddress/:id',usercontroller.editaddress)




module.exports = router;

