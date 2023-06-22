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
const admin = require("../models/adminmodels");
const bcrypt = require("bcrypt");
dotenv.config();
module.exports = {
  adminlogin: function (req, res) {
    try {
      res.render("admin/adminlogin");
    } catch (err) {
      console.error(err);
    }
  },
  adminpostlogin: async (req, res) => {
    try {
      admin.findOne({ username: req.body.email }).then((validuser, err) => {
        if (err) {
          reject(err);
        } else {
          if (validuser) {
            bcrypt
              .compare(req.body.password, validuser.password)
              .then((isPasswordMatch, err) => {
                if (err) {
                  reject(err);
                } else {
                  if (isPasswordMatch) {
                    req.session.admin = true;
                    res.redirect("/admin/adminpanel");
                  } else {
                    let msg = "Incorrect password";
                    res.render("admin/adminlogin.ejs", { msg });
                  }
                }
              });
          } else {
            let msg = "Invalid email ";
            res.render("admin/adminlogin.ejs", { msg });
          }
        }
      });
    } catch (error) {}
  },
  adminpanel: async (req, res) => {
    try {
      const orderStatus = await orderhelper.getAllOrderStatusesCount();
      const chartData = await adminhelper.getChartDetails();
      const dashboardDetails = await adminhelper.getDashboardDetails();
      dashboardDetails.totalRevenue = currencyFormat(
        dashboardDetails.totalRevenue
      );
      dashboardDetails.monthlyRevenue = currencyFormat(
        dashboardDetails.monthlyRevenue
      );
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

  adminlogout: function (req, res) {
    try {
      req.session.admin = false;
      res.redirect("/admin");
    } catch (err) {
      console.error(err);
    }
  },
  userlist: async (req, res) => {
    try {
      const users = await user.find();
      res.render("admin/user-list", { users });
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
        let categories = await category.find();
        res.render("admin/categories.ejs", { categories });
      }
    } catch (err) {
      console.error(err);
    }
  },
  addcategory: (req, res) => {
    try {
      adminhelper.addcategory(req.body).then((response) => {
        res.json(response);
      });
    } catch (err) {
      console.error(err);
    }
  },
  productlist: async (req, res) => {
    try {
      let products = await product.find();
      res.render("admin/products-list.ejs", { products });
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
      let images = req.files;
      adminhelper.addproductpost(req.body, images).then((response) => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {
      console.error(error);
    }
  },
  blockuser: async (req, res) => {
    try {
      let userid = req.params.id;
      adminhelper.blockuser(userid).then((responce) => {
        req.session.user = false;
        res.redirect("/admin/user-list");
      });
    } catch (error) {}
  },
  unblockuser: async (req, res) => {
    try {
      let userid = req.params.id;
      adminhelper.unblockuser(userid).then((responce) => {
        res.redirect("/admin/user-list");
      });
    } catch (error) {}
  },
  deleteproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      adminhelper.deleteproduct(productid).then((response) => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  activeproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      adminhelper.activeproduct(productid).then((response) => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  deactiveproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      adminhelper.deactiveproduct(productid).then((response) => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  editproduct: async (req, res) => {
    try {
      let productid = req.params.id;
      let productdetail = await product.findById(productid);
      let categories = await category.find();
      res.render("admin/editproduct", { productdetail, categories });
    } catch (error) {}
  },
  editproductpost: async (req, res) => {
    try {
      let productid = req.params.id;
      let images = req.files;
      adminhelper.editproduct(req.body, images, productid).then((response) => {
        res.redirect("/admin/products-list");
      });
    } catch (error) {}
  },
  deletcategory: async (req, res) => {
    try {
      let categoryid = req.params.id;
      adminhelper.deletcategory(categoryid).then((response) => {
        res.redirect("/admin/categories");
      });
    } catch (error) {}
  },
  forgotpassword: async (req, res) => {
    try {
      res.render("admin/forgotpassword");
    } catch (error) {}
  },
  checkOTPforgot: function (req, res) {
    adminhelper.checkOTPforgot(req.body).then((response) => {
      if (response.status) {
        let phonenumber = response.validUser.phonenumber;
        res.render("admin/verifyotp-admin.ejs", { phonenumber });
      } else {
        let msg = response.msg;
        res.render("admin/forgotpassword", { msg });
      }
    });
  },
  orderlist: async (req, res) => {
    try {
      let orders = await orderhelper.getAllOrders();
      res.render("admin/order-list", { orders });
    } catch (error) {
      console.log("erorrrrrr");
    }
  },

  orderdetail: async (req, res) => {
    let orderId = req.params.id;
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
      res.render("admin/orders-detail", { Order: order[0] });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  cancelOrder: async (req, res) => {
    try {
      let orderId = req.params.id;
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
      res.render("admin/coupon.ejs", { coupon });
    } catch (error) {}
  },
  addcoupon: async (req, res) => {
    try {
      let couponAmount = parseInt(req.body.couponAmount);

      if (couponAmount < 50 || couponAmount > 500) {
        res.json({ status: false });
      } else {
        adminhelper
          .addCoupon(req.body)
          .then((response) => {
            res.json(response);
          })
          .catch((error) => {
            res.status(500).json({ error: "Coupon could not be added" });
          });
      }
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  },

  salesReportPage: async (req, res) => {
    const sales = await adminhelper.getAllDeliveredOrders();
    sales.forEach((order) => {
      order.orderDate = dateFormat(order.orderDate);
    });
    res.render("admin/salesReport", { sales });
  },
  salesReport: async (req, res) => {
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
      const products = await product
        .find({ productname: { $regex: query, $options: "i" } })
        .lean();
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
      let Category = await category.find();
      let offer = await Offer.find();
      res.render("admin/offer.ejs", { Category, offer });
    } catch (error) {}
  },
  addOffer: async (req, res) => {
    try {
      adminhelper.addOffer(req.body);
      res.redirect("/admin/offer");
    } catch (error) {}
  },
  activeOffer: async (req, res) => {
    try {
      let offerId = req.params.id;
      adminhelper.activeOffer(offerId).then((response) => {
        res.json(response);
      });
    } catch (error) {}
  },
  deactiveOffer: async (req, res) => {
    try {
      let offerId = req.params.id;
      adminhelper.deactiveOffer(offerId).then((response) => {
        res.json(response);
      });
    } catch (error) {}
  },
  deleteOffer: async (req, res) => {
    try {
      let offerId = req.params.id;
      adminhelper.deleteOffer(offerId).then((response) => {
        res.json(response);
      });
    } catch (error) {}
  },
  deletecoupon: async (req, res) => {
    try {
      let couponId = req.params.id;
      adminhelper.deleteCoupon(couponId).then((response) => {
        res.json(response);
      });
    } catch (error) {}
  },
  orderDelivery: async (req, res) => {
    try {
      let orderId = req.params.id;
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
