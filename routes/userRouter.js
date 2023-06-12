 var express = require('express');
 var router = express.Router();
/* GET home page. */
const usercontroller= require('../controller/usercontroller');
const userhelper = require('../helpers/userhelper');
const categorycontroller = require ("../controller/categorycontroller")
const {userauthentication,userCheck} = require('../middleware/session')


router.get('/',userauthentication,usercontroller.landingpage)
router.get('/home',userCheck, usercontroller.home)
router.get('/login',userauthentication,usercontroller.userlogin)
router.get('/login-OTP',userauthentication,usercontroller.OTPlogin)
router.get('/signup',userauthentication,usercontroller.usersignup)
router.get('/contact',usercontroller.usercontact)
router.get('/blog',usercontroller.userblog)
router.get('/shop',usercontroller.usershop)
router.post('/signup',usercontroller.signuppost)
router.post('/login',usercontroller.loginpost)
router.post('/checkOTP',usercontroller.checkOTP)
router.post('/checkOTPforgot',usercontroller.checkOTPforgot)
router.get('/logout',usercontroller.userlogout)
router.post('/verifyotp',userauthentication,userhelper.verifyOTP)
router.post('/verifyotpforgot',userauthentication,userhelper.verifyOTPforgot)
router.get('/product-details/:id',usercontroller.productdetails)
router.get('/forgotpassword',userauthentication,usercontroller.forgotpassword)
router.post('/resetpasspost/:id',userauthentication,usercontroller.resetpasspost)
router.get('/shop-cart',userCheck,usercontroller.shopcart)
router.post('/addToCart',userCheck,usercontroller.addToCart)
router.put('/removecartitem/:id',usercontroller.removecartitem)
router.post('/changeQuantity',usercontroller.changeQuantity)
router.get('/checkout',userCheck,usercontroller.checkout)
router.post('/addAddress',usercontroller.addAddress)
router.post('/placeOrder',usercontroller.placeOrder)
router.get('/ordersuccess',usercontroller.ordersuccess)
router.get('/order-list',usercontroller.orderlist)
router.get('/category/:id',categorycontroller.category)
router.get('/order-detailes/:id',usercontroller.orderdetailes)
router.post('/verify-payment',usercontroller.veryfyPayment)
router.get('/profile',usercontroller.profile)
router.put('/cancelOrder/:id',usercontroller.cancelOrder)
router.put('/ReturnOrder/:id',userCheck,usercontroller.ReturnOrder)
router.get('/search',usercontroller.search)
router.post('/apply-coupon',usercontroller.applyCoupon)
router.get('/wishlist',userCheck,usercontroller.wishlist);
router.post('/add-to-wishList',userCheck,usercontroller.addToWishList);
router.put('/remove-from-wishList/:id',usercontroller.removeFromWishList)
router.put('/deleteaddress/:id',usercontroller.deleteaddress)
router.put('/editaddress/:id',usercontroller.editaddress)
router.post('/filter-results',usercontroller.filter)

// router.get('/payment-failed',usercontroller.paymentfailed)
// router.get('/categoryhoddie',categorycontroller.categoryhoddie)


module.exports = router;

