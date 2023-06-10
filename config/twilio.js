
const dotenv=require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);




const twilioFunctions = {
  
    generateOTP: async (phonenumber) => {

      client,
      
      
      client.verify.v2
        .services('VAcf98a49832344e18ee4a4d7842816268')
        .verifications.create({ to: `+91${phonenumber}`, channel: "sms" }).then(service => console.log(service.sid));;
        
    },
  };                             
  
  module.exports = twilioFunctions;