
const mongoose= require('mongoose');

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true,
    unique: true,
  },
  // productcolor: {
  //   type: String,
  // },
  // productsize: {
  //   type: String,
  //   required: true,
    
  // },
  // productbrand: {
  //   type: String,
  //   required: true,
    
  // },
  
  productpromotionalprice: {
    type: Number,
    required: true,
  },
  productregularprice: {
    type: Number,
    required: true,
  },
  productdescription: {
    type: String,
    required: true,
  },
  productweight:{
    type: Number,
    required: true
  },
  // producshippingfees:{
  //   type: Number,
  //   required: true
  // },
  productdeactive:{
    type: Boolean,
    default:false,
  },
  productimage:{
    type:Array,
  },
  
  productcategory: {
    type: String,
    required: true,
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "category",
  },
  productQuantity:{
    type: Number,
    required: true,
  },
  featuredImage:{
    type : String,
    require : true
    },
  productColor:{
    type : String,
    require : true
},
productoffer:{
  type: Boolean,
  default:false,
},
  // productstatus: {
  //   type: Boolean,
  //   default: true,
  // },
  // productquantity: {
  //   type: Number,
  // },

  
});

const product = mongoose.model('product', productSchema);

module.exports = product