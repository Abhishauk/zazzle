var express = require('express');
const admincontroller = require('../controller/admincontroller');
const adminhelper = require('../helpers/adminhelper');
const {adminauthentication,admincheck} = require('../middleware/session')
var router = express.Router();
/* GET users listing. */
router.get('/',adminauthentication,admincontroller.adminlogin)
router.get('/adminpanel',admincheck,admincontroller.adminpanel)
router.post('/adminlogin',admincontroller.adminpostlogin)
router.get('/logout',admincontroller.adminlogout)
router.get('/user-list',admincheck,admincontroller.userlist)
router.get('/viewuser/:_id',admincheck,admincontroller.viewuser)
router.get('/categories',admincheck,admincontroller.categories)
router.post('/add-category',admincheck,admincontroller.addcategory)
router.get('/products-list',admincheck,admincontroller.productlist)
router.get('/addproduct',admincheck,admincontroller.addproduct)
router.post('/addproductpost',admincheck,admincontroller.addproductpost)
router.put('/blockuser/:id',admincheck,admincontroller.blockuser)
router.put('/unblockuser/:id',admincheck,admincontroller.unblockuser)
router.put('/deleteproduct/:id',admincheck,admincontroller.deleteproduct)
router.get('/activeproduct/:id',admincheck,admincontroller.activeproduct)
router.get('/deactiveproduct/:id',admincheck,admincontroller.deactiveproduct)
router.get('/editproduct/:id',admincheck,admincontroller.editproduct)
router.post('/editproductpost/:id',admincheck,admincontroller.editproductpost)
router.put('/deletecategory/:id',admincheck,admincontroller.deletcategory)
router.get('/order-list',admincheck,admincontroller.orderlist)
router.get('/orders-detail/:id',admincheck,admincontroller.orderdetail)
router.put('/cancelOrder/:id',admincheck,admincontroller.cancelOrder)
router.put('/ReturnOrder/:id',admincheck,admincontroller.ReturnOrder)
router.get('/coupon',admincheck,admincontroller.coupon)
router.post('/add-coupon',admincheck,admincontroller.addcoupon)
router.put('/deletecoupon/:id',admincheck,admincontroller.deletecoupon)
router.get('/salesReport',admincheck,admincontroller.salesReportPage);
router.post('/sales-report',admincheck,admincontroller.salesReport);
router.get('/search-admin',admincontroller.searchadmin)
router.get('/offer',admincheck,admincontroller.offer)
router.post('/add-offer',admincheck,admincontroller.addOffer)
router.put('/activeOffer/:id',admincheck,admincontroller.activeOffer)
router.put('/deactiveOffer/:id',admincheck,admincontroller.deactiveOffer)
router.put('/deleteOffer/:id',admincheck,admincontroller.deleteOffer)
router.put('/orderDelivery/:id',admincheck,admincontroller.orderDelivery)
// router.get('/forgotpassword',admincontroller.forgotpassword)
// router.post('/checkOTPforgot-admin',admincontroller.checkOTPforgot)
// router.post('/verifyotpforgot',adminauthentication,adminhelper.verifyOTPforgotadmin)


module.exports = router;
