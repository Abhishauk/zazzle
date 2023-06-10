const { response } = require("express");
const adminhelper = require("../helpers/adminhelper");
const user = require("../models/usermodels");
const category = require("../models/categorymodels");
const product = require("../models/productmodels");
const Coupon = require("../models/couponmodels");
const dotenv = require("dotenv");
const twilioFunctions = require("../config/twilio");
const orderhelper = require("../helpers/orderhelper");
const Order = require("../models/ordermodels");
const Offer = require("../models/offermodels");
const ObjectId = require("mongoose").Types.ObjectId;
dotenv.config();
module.exports = {
  adminlogin: function(req, res) {
    try {
      res.render("admin/adminlogin");
    } catch (err) {
      console.error(err);
    }
  },
  adminpostlogin: async (req, res) => {
    try {
      if (req.body.email == "admin@gmail.com" && req.body.password == "123") {
        console.log(req.body);
        req.session.admin = true;
        res.redirect("/admin/adminpanel");
      } else {
        let msg = "invalid email or password";
        res.render("admin/adminlogin", { msg });
      }
    } catch (err) {
      console.error(err);
    }
  },
  adminpanel: async (req, res) => {
    try {
      console.log("sidharth");
      const orderStatus = await orderhelper.getAllOrderStatusesCount();
      const chartData = await adminhelper.getChartDetails();
      const dashboardDetails = await adminhelper.getDashboardDetails();
      console.log(chartData);
      dashboardDetails.totalRevenue = currencyFormat(
        dashboardDetails.totalRevenue
      );
      dashboardDetails.monthlyRevenue = currencyFormat(
        dashboardDetails.monthlyRevenue
      );
      console.log("dashboardDetails", dashboardDetails);
      //     res.render("admin/admin-home", { orderStatus, chartData, dashboardDetails, layout: "layouts/adminLayout" });
      //   } catch {
      //     res.status(500);
      //   }
      const data = {
        dashboardDetails,
        orderStatus,
        chartData,
        req: req,
        currentUrl: req.url
      };
      res.render("admin/adminpanel.ejs", data);
    } catch (err) {
      console.error(err);
    }
  },

  adminlogout: function(req, res) {
    try {
      req.session.admin = false;
      res.redirect("/admin");
    } catch (err) {
      console.error(err);
    }
  },
  userlist: async (req, res) => {
    try {
      const count = parseInt(req.query.count) || 5;
      const page = parseInt(req.query.page) || 1;
      const totalCount = await user.countDocuments();
      console.log(totalCount);
      const startIndex = (page - 1) * count;
      console.log(startIndex);
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

      const users = await user.find().skip(startIndex).limit(count).lean();
      console.log(users);
      res.render("admin/user-list", { users, pagination });
    } catch (err) {
      console.log(err);
    }
  },
  viewuser: async (req, res) => {
    try {
      let userId = req.params._id;
      const users = await user.findById(userId);

      res.render("admin/user-detail", { users });
    } catch (err) {
      console.error(err);
    }
  },
  categories: async (req, res) => {
    try {
      if (req.session.admin) {
        // const viewCategory = await adminhelper.getallcategory();
        // let products = await product.find()
        let categories = await category.find();
        res.render("admin/categories.ejs", { categories });
      }
    } catch (err) {
      console.error(err);
    }
  },
  // addcategory: async (req, res) => {
  //   try {
  //     console.log("hhhhh");
  //     console.log(req.body);
  //     adminhelper.addcategory(req.body).then((response) => {
  //       console.log("haiwa");
  //       console.log(response);
  //       res.json(response)
  //     });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // },.

  addcategory: (req, res) => {
    try {
      adminhelper.addcategory(req.body).then(response => {
        console.log(response);
        res.json(response);
        // res.redirect("/admin/categories")
      });
    } catch (err) {
      console.error(err);
    }
  },
  productlist: async (req, res) => {
    try {
      const count = parseInt(req.query.count) || 3;
      const page = parseInt(req.query.page) || 1;
      const totalCount = await product.countDocuments();
      console.log(totalCount);
      const startIndex = (page - 1) * count;
      console.log(startIndex);
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

      let products = await product.find().skip(startIndex).limit(count).lean();
      res.render("admin/products-list.ejs", { products, pagination });
    } catch (err) {
      console.error(err);
    }
  },
  addproduct: async (req, res) => {
    try {
      let categories = await category.find();
      res.render("admin/addproduct.ejs", { categories });
    } catch (err) {
      console.error(err);
    }
  },
  addproductpost: async (req, res) => {
    try {
      console.log(req.file);
      console.log(req.body);
      let images = req.files;
      adminhelper.addproductpost(req.body, images).then(response => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {
      console.error(error);
    }
  },
  blockuser: async (req, res) => {
    try {
      let userid = req.params.id;
      // console.log(userid);
      adminhelper.blockuser(userid).then(responce => {
        console.log(responce);

        console.log(req.session.userid);
        req.session.user = false;
        res.redirect("/admin/user-list");
      });
    } catch (error) {}
  },
  unblockuser: async (req, res) => {
    try {
      let userid = req.params.id;
      // console.log(userid);
      adminhelper.unblockuser(userid).then(responce => {
        console.log(responce);
        res.redirect("/admin/user-list");
      });
    } catch (error) {}
  },
  deleteproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      adminhelper.deleteproduct(productid).then(response => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  activeproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      adminhelper.activeproduct(productid).then(response => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  deactiveproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      console.log(productid);
      adminhelper.deactiveproduct(productid).then(response => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  editproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      console.log(productid);
      let productdetail = await product.findById(productid);
      let categories = await category.find();
      res.render("admin/editproduct", { productdetail, categories });
    } catch (error) {}
  },
  editproductpost: async (req, res) => {
    try {
      let productid = req.params.id;
      console.log(productid);
      console.log(req.body);
      console.log(req.files);
      let images = req.files;
      adminhelper.editproduct(req.body, images, productid).then(response => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  deletcategory: async (req, res) => {
    try {
      let categoryid = req.params.id;
      adminhelper.deletcategory(categoryid).then(response => {
        res.redirect("/admin/categories");
      });
    } catch (error) {}
  },
  forgotpassword: async (req, res) => {
    try {
      res.render("admin/forgotpassword-admin");
    } catch (error) {}
  },
  checkOTPforgot: function(req, res) {
    adminhelper.checkOTPforgot(req.body).then(response => {
      if (response.status) {
        let phonenumber = response.validUser.phonenumber;
        res.render("admin/verifyotp-admin.ejs", { phonenumber });
      } else {
        console.log(response.msg2);
        let msg = response.msg;
        res.render("admin/forgotpassword-admin", { msg });
      }
    });
  },
  orderlist: async (req, res) => {
    try {
      const count = parseInt(req.query.count) || 3;
      const page = parseInt(req.query.page) || 1;
      const totalCount = await Order.countDocuments();
      console.log(totalCount);
      const startIndex = (page - 1) * count;
      console.log(startIndex);
      const totalPages = Math.ceil(totalCount / count);

      // Generate a random offset based on the total count and the page size
      const randomOffset = Math.floor(Math.random() * (totalCount - count));
      const endIndex = Math.min(count, totalCount - startIndex);
      console.log(endIndex);

      const pagination = {
        totalCount: totalCount, // change this to `totalCount` instead of `totalProductsCount`
        totalPages: totalPages,
        page: page,
        count: count,
        startIndex: startIndex,
        endIndex: endIndex
      };
      let orders = await orderhelper.getAllOrders();
      console.log(orders);
      res.render("admin/order-list", { orders, pagination });
    } catch (error) {
      console.log("erorrrrrr");
    }
  },

  orderdetail: async (req, res) => {
    let orderId = req.params.id;
    console.log(orderId);

    try {
      const order = await Order.aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "products",
            localField: "orderedItems.productId",
            foreignField: "_id",
            as: "orderedItems.productId"
          }
        },
        {
          $lookup: {
            from: "addresses",
            localField: "address",
            foreignField: "_id",
            as: "address"
          }
        }
      ]);

      console.log(order);
      console.log(order[0].address[0].address);
      console.log(order[0].user.email);

      console.log(order[0].orderedItems);
      res.render("admin/orders-detail", { Order: order[0] });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  cancelOrder: async (req, res) => {
    try {
      let orderId = req.params.id;

      console.log(orderId);
      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "Cancelled"
          }
        }
      );
      res.json({ status: true });
    } catch (error) {}
  },
  ReturnOrder: async (req, res) => {
    try {
      let orderId = req.params.id;
      console.log(orderId);
      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "Return"
          }
        }
      );
      res.json({ status: true });
    } catch (error) {}
  },
  coupon: async (req, res) => {
    try {
      let coupon = await Coupon.find();
      console.log(coupon);
      res.render("admin/coupon.ejs", { coupon });
    } catch (error) {}
  },
  addcoupon: async (req, res) => {
    try {
      console.log(req.body);
      adminhelper.addCoupon(req.body);
      res.redirect("/admin/coupon");
    } catch (error) {}
  },
  salesReportPage: async (req, res) => {
    const sales = await adminhelper.getAllDeliveredOrders();
    console.log("sales", sales);
    sales.forEach(order => {
      order.orderDate = dateFormat(order.orderDate);
      // order.totalAmount=dateFormat(order.totalAmount)
    });
    res.render("admin/salesReport", { sales });
  },
  salesReport: async (req, res) => {
    console.log(req.body);
    try {
      let { startDate, endDate } = req.body;

      startDate = new Date(startDate);
      endDate = new Date(endDate);

      const salesReport = await adminhelper.getAllDeliveredOrdersByDate(
        startDate,
        endDate
      );
      for (let i = 0; i < salesReport.length; i++) {
        salesReport[i].orderDate = dateFormat(salesReport[i].orderDate);
        salesReport[i].totalAmount = currencyFormat(salesReport[i].totalAmount);
      }
      res.status(200).json({ sales: salesReport });
    } catch (error) {
      console.log(error);
    }
  },
  searchadmin: async (req, res) => {
    try {
      const query = req.query.query;
      console.log(query);
      // Perform the search query using the provided search term
      const products = await product
        .find({ productname: { $regex: query, $options: "i" } })
        .lean();
      console.log(products);
      res.redirect(
        "/product-list?array=" + encodeURIComponent(JSON.stringify(products))
      );
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  offer: async (req, res) => {
    try {
      // const count = parseInt(req.query.count) || 3;
      // const page = parseInt(req.query.page) || 1;
      // const totalCount = await product.countDocuments();
      // const startIndex = (page - 1) * count;
      // const totalPages = Math.ceil(totalCount / count);

      // Generate a random offset based on the total count and the page size
      // const randomOffset = Math.floor(Math.random() * (totalCount - count));
      // const endIndex = Math.min(count, totalCount - startIndex);
      // const pagination = {
      //   totalCount: totalCount, // change this to `totalCount` instead of `totalProductsCount`
      //   totalPages: totalPages,
      //   page: page,
      //   count: count,
      //   startIndex: startIndex,
      //   endIndex: endIndex
      // };
      let Category = await category.find();
      let offer = await Offer.find()
      console.log(category);
      res.render("admin/offer.ejs", { Category, offer});
    } catch (error) {}
  },
  addOffer: async (req, res) => {
    try {
      console.log(req.body);
      adminhelper.addOffer(req.body);
      res.redirect("/admin/offer");
    } catch (error) {}
  },
  activeOffer: async (req, res) => {
    try {
      let offerId = req.params.id;
      adminhelper.activeOffer(offerId).then(response => {
        res.json(response);
      });
    } catch (error) {}
  },
  deactiveOffer: async (req, res) => {
    try {
      let offerId = req.params.id;
      adminhelper.deactiveOffer(offerId).then(response => {
        res.json(response);
      });
    } catch (error) {}
  },
  deleteOffer:async(req,res)=>{
    try {
        let offerId=req.params.id
        adminhelper.deleteOffer(offerId).then((response)=>{
            res.json(response)
        })
    } catch (error) {
        
      }
    },
deletecoupon:async(req,res)=>{
  try {
      let couponId=req.params.id
      adminhelper.deleteCoupon(couponId).then((response)=>{
          res.json(response)
      })
  } catch (error) {
      
      }
    },
  orderDelivery: async (req, res) => {
    try {
      let orderId = req.params.id;
      console.log(orderId);
      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "delivered"
          }
        }
      );
      res.json({ status: true });
    } catch (error) {}
  }
};
function currencyFormat(amount) {
  return Number(amount).toLocaleString("en-in", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0
  });
}
function dateFormat(date) {
  return date.toISOString().slice(0, 10);
}
