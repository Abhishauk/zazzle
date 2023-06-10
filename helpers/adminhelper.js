const mongoose = require("mongoose");
const user = require("../models/usermodels");
const Category = require("../models/categorymodels");
const product = require("../models/productmodels");
const address = require("../models/addressmodels");
const orderModel = require("../models/ordermodels");
const Coupon = require("../models/couponmodels");
const Offer = require("../models/offermodels");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const voucherCode = require("voucher-code-generator")
const session = require("express-session");
const twilioFunctions = require("../config/twilio");
const { category } = require("../controller/categorycontroller");
dotenv.config();
module.exports = {
  addcategory: async category => {
    try {
      
      console.log(category);
      console.log(category.category);
      const existingCategory = await Category.findOne({
        categoryname: { $regex: new RegExp(`^${category.category}$`, "i") }
      });
    
      console.log(existingCategory);

      if (existingCategory) {
        return { status: false, message: "Category already exists" };
      }

      const newCategory = new Category({
        categoryname: category.category
      });
      await newCategory.save();
      
      return { status: true };
    } catch (error) {
      console.error("Error adding category:", error);
      return {
        status: false,
        message: "An error occurred while adding the category"
      };
    }
  },

  addproductpost: async (body, images) => {
    try {
      console.log(body);
      const newproduct = new product({
        productname: body.productname,
        productdescription: body.description,
        productpromotionalprice: body.promotionalprice,
        productregularprice: body.regularprice,
        productweight: body.weight,
        productcategory: body.category,
        productQuantity:body.quantity,
        productimage: images.map(images => images.filename)
      });
      await newproduct.save();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  },
  blockuser: async body => {
    try {
      let userid = body;
      let userdetail = await user.findById(userid);
      userdetail.block = true;
      // userdetail.isActive = !userdetail.isActive
      await userdetail.save();
   
      console.log(req.session.userid);
      // req.session.user= false
      console.log(userdetail);
    } catch (error) {
      console.error("Failed to block user");
    }
  },
  unblockuser: async body => {
    try {
      let userid = body;
      let userdetail = await user.findById(userid);
      userdetail.block = false;
      await userdetail.save();
      console.log(userdetail);
    } catch (error) {
      console.error("Failed to unblock user");
    }
  },
  deleteproduct: async body => {
    try {
      let productid = body;
      await product.findByIdAndDelete(productid);
    } catch (error) {}
  },
  activeproduct: async body => {
    try {
      let productid = body;
      let productdetail = await product.findById(productid);
      productdetail.productdeactive = false;
      await productdetail.save();
    } catch (error) {}
  },
  deactiveproduct: async body => {
    try {
      let productid = body;
      let productdetail = await product.findById(productid);
      console.log(productdetail);
      productdetail.productdeactive = true;
      await productdetail.save();
    } catch (error) {}
  },
  editproduct: async (body, file, productid) => {
    try {
      
      console.log(productid);
      if (file.length == 0) {
       
        await product.findByIdAndUpdate(
          { _id: productid },
          {
            $set: {
              productname: body.productname,
              productpromotionalprice: body.promotionalprice,
              productweight: body.weight,
              productregularprice: body.regularprice,
              productdescription: body.description,
              productQuantity: body.quantity,
              productcategory: body.category
            }
          }
        );
      } else {
        console.log("file");

        await product.findByIdAndUpdate(
          { _id: productid },
          {
            $set: {
              productname: body.productname,
              productweight: body.weight,
              productpromotionalprice: body.promotionalprice,
              productregularprice: body.regularprice,
              productdescription: body.description,
              productQuantity: body.quantity,
              productcategory: body.category,
              productimage: file.map(file => file.filename)
            }
          }
        );
      }
    } catch (error) {}
  },
  checkOTPforgot: function(body) {
    return new Promise(function(resolve, reject) {
      try {
        user
          .findOne({ phonenumber: body.phonenumber })
          .then((validUser, err) => {
            if (err) {
              reject(err);
            } else {
              if (validUser) {
                console.log(validUser);

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
  verifyOTPforgotadmin: async (req, res) => {
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
        .then(async verificationChecks => {
          if (verificationChecks.status === "approved") {
            let user1 = await user.findOne({ phonenumber: phonenumber });
            console.log(
              `User ${user1._id} logged in with phone number ${phonenumber}`
            );
            res.render("admin/resetpass-admin.ejs", { user1 });
          } else {
            let msg = "Incorrect OTP!!!";
            res.render("admin/verifyOTPforgot", { msg, phonenumber });
          }
        });
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: error.message
      });
    }
  },
  deletcategory: async categoryid => {
    try {
      
      console.log(categoryid);
      let categorydetailes = await Category.findById(categoryid);
      console.log(categorydetailes);
      let categoryname = categorydetailes.categoryname;
      await product.deleteMany({ productcategory: categoryname });
      await Category.findByIdAndDelete(categoryid);
    } catch (error) {}
  },
  getDashboardDetails:async () => {
    return new Promise(async (resolve, reject) => {
        let response = {}
        let totalRevenue, monthlyRevenue, totalProducts;

        totalRevenue = await orderModel.aggregate([
            {
                $match: { orderStatus: 'delivered' }
            },

            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ])
        console.log(totalRevenue);
        response.totalRevenue = totalRevenue[0].revenue;

        monthlyRevenue = await orderModel.aggregate([
            {
                $match: {
                    orderStatus: 'delivered',
                    orderDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }

                }
            }
        ])
        console.log(monthlyRevenue);
        response.monthlyRevenue = monthlyRevenue[0]?.revenue

        totalProducts = await product.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$productQuantity" }
                }
            }
        ])
        console.log(totalProducts);
        response.totalProducts = totalProducts[0]?.total;

        response.totalOrders = await orderModel.find({ orderStatus: 'placed' }).count();

        response.numberOfCategories = await Category.find({}).count();

        console.log(response);
        console.log("vvv");
        resolve(response)
    })
},

getChartDetails: async() => {
  return new Promise(async (resolve, reject) => {
      const orders = await orderModel.aggregate([
          {
              $match: { orderStatus: 'delivered' }
          },
          {
              $project: {
                  _id: 0,
                  orderDate: "$createdAt"
              }
          }
      ])

      let monthlyData = []
      let dailyData = []

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      let monthlyMap = new Map();
      let dailyMap = new Map();

      //converting to monthly order array

      //taking the count of orders in each month
      orders.forEach((order) => {
          const date = new Date(order.orderDate);
          const month = date.toLocaleDateString('en-US', { month: 'short' });

          if (!monthlyMap.has(month)) {
              monthlyMap.set(month, 1);
          } else {
              monthlyMap.set(month, monthlyMap.get(month) + 1);
          }
      })

      for (let i = 0; i < months.length; i++) {
          if (monthlyMap.has(months[i])) {
              monthlyData.push(monthlyMap.get(months[i]))
          } else {
              monthlyData.push(0)
          }
      }

      //taking the count of orders in each day of a week
      orders.forEach((order) => {
          const date = new Date(order.orderDate);
          const day = date.toLocaleDateString('en-US', { weekday: 'long' })

          if (!dailyMap.has(day)) {
              dailyMap.set(day, 1)
          } else {
              dailyMap.set(day, dailyMap.get(day) + 1)
          }
      })

      for (let i = 0; i < days.length; i++) {
          if (dailyMap.has(days[i])) {
              dailyData.push(dailyMap.get(days[i]))
          } else {
              dailyData.push(0)
          }
      }

      resolve({ monthlyData: monthlyData, dailyData: dailyData })

        })
    },
addCoupon:(couponData) => {
  return new Promise(async (resolve, reject) => {

      const dateString = couponData.couponExpiry;
      const [day, month, year] = dateString.split(/[-/]/);
      const date = new Date(`${year}-${month}-${day}`);





      
      const convertedDate = date.toISOString();

      let couponCode=voucherCode.generate({
          length: 6,
          count: 1,
          charset: voucherCode.charset("alphabetic")
      });

      console.log("voucher code generator",couponCode[0]);

      console.log(convertedDate);

      const coupon = await new Coupon({
          couponName: couponData.couponName,
          code: couponCode[0],
          discount: couponData.couponAmount,
          expiryDate: convertedDate
      })

      await coupon.save()
          .then(() => {
              resolve(coupon._id)
          })
          .catch((error) => {
              reject(error)
          })
      })
  },
getAllDeliveredOrders: () => {
  return new Promise(async (resolve, reject) => {
    await orderModel.aggregate([
      {
        $match: { orderStatus: "delivered" },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
    ]).then((result) => {
      resolve(result);
    });
    });
  },
getAllDeliveredOrdersByDate: (startDate, endDate) => {
  console.log(endDate);
  return new Promise(async (resolve, reject) => {
    await orderModel.find({
      orderDate: { $gte: startDate, $lte: endDate },
      orderStatus: "delivered",
    })
      .lean()
      .then((result) => {
        console.log("orders in range", result);
        resolve(result);
      });
    });
  },
addOffer:(offerData) => {
  console.log("aaa");
  console.log(offerData);
  return new Promise(async (resolve, reject) => {

      const dateString = offerData.endDate;
      const [year,month,day] = dateString.split(/[-/]/);
      const date = new Date(`${year}-${month}-${day}`);
      const convertedDate = date.toISOString();

    

      console.log(convertedDate);

      const offer = await new Offer({
          title: offerData.name,
          category: offerData.category,
          discount: offerData.discount,
          endDate: convertedDate
      })

      await offer.save()
          .then(() => {
              resolve(offer._id)
          })
          .catch((error) => {
              reject(error)
          })
      })
  },
activeOffer: async (body) => {
  try {
    let offerid = body
    let offerdetail = await Offer.findById(offerid)
    offerdetail.offeractive = true
    await offerdetail.save()

   let discount=offerdetail.discount
   let categoryname=offerdetail.category

   let products=await product.find({productcategory:categoryname})

   for(let product of products){
    product.productpromotionalprice=product.productpromotionalprice-discount
    await product.save()
   }

   
   return({status:true})
  } 
  catch (error) {
    
  }
  
},

deactiveOffer: async (body) => {
  try {
    let offerid = body
    let offerdetail = await Offer.findById(offerid)
   offerdetail.offeractive = false
   await offerdetail.save()

   let discount=offerdetail.discount
   let categoryname=offerdetail.category

   let products=await product.find({productcategory:categoryname})

   for(let product of products){
    product.productpromotionalprice=product.productpromotionalprice+discount
    await product.save()
   }

   return({status:true})
  } 
  catch (error) {
    
  }
  
},
deleteOffer: async (body) => {
  try {
    let offerId = body
    await Offer.findByIdAndDelete(offerId,);
    return({status:true})
  } 
  catch (error) {
    
    }
    

  },
deleteCoupon: async (body) => {
  try {
    let couponId = body
    await Coupon.findByIdAndDelete(couponId);
    return({status:true})
  } 
  catch (error) {
    
    }
    

  },



};
