const twilioFunctions = require("../config/twilio");
const user = require("../models/usermodels");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  checkotpSignup: function (phonenumber) {
    return new Promise((resolve, reject) => {
      try {
        twilioFunctions.generateOTP(phonenumber);
        let msg = "OTP sent";
        resolve({ status: true, msg });
      } catch (error) {
        reject(error);
      }
    });
  },

  verifyOTPSignup: async (req, res) => {
    const otp =
      req.body.otp1 +
      req.body.otp2 +
      req.body.otp3 +
      req.body.otp4 +
      req.body.otp5;
    const phonenumber = req.body.phone;
    let body = req.session.signupdata;
    try {
      const verificationChecks = await client.verify
        .services("VAcf98a49832344e18ee4a4d7842816268")
        .verificationChecks.create({
          to: `+91${phonenumber}`,
          code: otp
        });

      if (verificationChecks.status === "approved") {
        const saltRounds = 10;
        const password = body.password;
        try {
          if (!password) {
            throw new Error("No password provided");
          }
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          const newUser = new user({
            username: body.username,
            email: body.email,
            password: hashedPassword,
            phonenumber: body.phonenumber,
            status: false
          });

          const savedUser = await newUser.save();
          req.session.user = true;
          req.session.userid = savedUser;
          res.redirect("/home");
        } catch (error) {
          console.error(error);
          res.render("catchError", { message: error.message });
        }
      } else {
        let msg = "Incorrect OTP";
        res.render("shop/verifyotpsignup.ejs", { msg, phonenumber });
      }
    } catch (error) {
      console.error(error);
      res.render("catchError", { message: error.message });
    }
  }
};
