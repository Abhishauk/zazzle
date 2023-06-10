const { response } = require('express')
const dotenv=require("dotenv");
const user =require('../models/usermodels')
const categorycategory = require ("../models/categorymodels")
const product = require ("../models/productmodels")
dotenv.config();

module.exports={
    category: async (req, res) => {
        console.log("zlzlzlzlzlaaa");
        try {
          const category = req.params.id;
          console.log(category);
          const products = await product.find({ productcategory: category });

          console.log(products);
          
          
          res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
        }
      },
    }

  
  

