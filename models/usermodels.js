const mongoose= require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
     required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  //   type: String,
  //   required: true
  // },
  phonenumber: { type: String,
     required: true,
      unique: true },
      
 status: { type: Boolean, default: true },
  block: {type:Boolean,
          default: false}
});

const user = mongoose.model('user', userSchema);

module.exports = user