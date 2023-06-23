var express = require('express');
const admincontroller = require('../controller/admincontroller');
const adminhelper = require('../helpers/adminhelper');
const {adminauthentication,admincheck} = require('../middleware/session')
var router = express.Router();
/* GET users listing. */
router.get('/',adminauthentication,admincontroller.adminlogin)
router.get('/adminpanel',admincheck,admincontroller.adminpanel)
router.get('/logout',admincontroller.adminlogout)
router.get('/user-list',admincheck,admincontroller.userlist)
router.get('/viewuser/:_id',admincheck,admincontroller.viewuser)
router.get('/categories',admincheck,admincontroller.categories)
router.get('/products-list',admincheck,admincontroller.productlist)
router.get('/addproduct',admincheck,admincontroller.addproduct)
router.get('/activeproduct/:id',admincheck,admincontroller.activeproduct)
router.get('/deactiveproduct/:id',admincheck,admincontroller.deactiveproduct)
router.get('/editproduct/:id',admincheck,admincontroller.editproduct)
router.get('/order-list',admincheck,admincontroller.orderlist)
router.get('/orders-detail/:id',admincheck,admincontroller.orderdetail)
router.get('/coupon',admincheck,admincontroller.coupon)
router.get('/sales-report',admincheck,admincontroller.salesReportPage);
router.get('/search-admin',admincontroller.searchadmin)
router.get('/offer',admincheck,admincontroller.offer)



router.post('/adminlogin',admincontroller.adminpostlogin)
router.post('/add-category',admincheck,admincontroller.addcategory)
router.post('/addproductpost',admincheck,admincontroller.addproductpost)
router.post('/editproductpost/:id',admincheck,admincontroller.editproductpost)
router.post('/add-coupon',admincheck,admincontroller.addcoupon)
router.post('/sales-report',admincheck,admincontroller.salesReport);



router.put('/blockuser/:id',admincheck,admincontroller.blockuser)
router.put('/unblockuser/:id',admincheck,admincontroller.unblockuser)
router.put('/deleteproduct/:id',admincheck,admincontroller.deleteproduct)
router.put('/deletecategory/:id',admincheck,admincontroller.deletcategory)
router.put('/cancelOrder/:id',admincheck,admincontroller.cancelOrder)
router.put('/ReturnOrder/:id',admincheck,admincontroller.ReturnOrder)
router.put('/deletecoupon/:id',admincheck,admincontroller.deletecoupon)
router.post('/add-offer',admincheck,admincontroller.addOffer)



router.put('/activeOffer/:id',admincheck,admincontroller.activeOffer)
router.put('/deactiveOffer/:id',admincheck,admincontroller.deactiveOffer)
router.put('/deleteOffer/:id',admincheck,admincontroller.deleteOffer)
router.put('/orderDelivery/:id',admincheck,admincontroller.orderDelivery)



module.exports = router;
