// import { logMessage } from "../middlewares/config/log.middleware";

const axios = require('axios');

export const sendSMS = async(to:string,otp:number)=> {
  // const apiUrl = 'https://api.afromessage.com/api/send';
  // const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiT0tZeEZhRnlQQUdnVGVmOGZlYWpLSG1XQ096VTVDM24iLCJleHAiOjE4Mjg4OTg1MzgsImlhdCI6MTY3MTEzMjEzOCwianRpIjoiMDgzMTVlOTgtOTA1MC00ZGU1LWFiMGYtMjllNTdlODhlYjA4In0.a6aIfi2FiSE0BvcfMlBA9xf-1M-GxhJqHLj84pepT8Q'; // Replace with your actual API key
  // const from = '9786';
  // const message = 'your otp is:'+otp;

  // try {
  //   const response = await axios.get(apiUrl, {
  //     params: {
  //       from,
  //       to:to || '251938232169',
  //       message,  
  //     },
  //     headers: {
  //       Authorization: `Bearer ${apiKey}`,
  //     },
  //   });
 
//   const message = {
//     "secret": "8d718f6fcaadb81a462175df7da918ffa6f1d2b0",
//     "type": "sms",
//     "mode": "devices",
//     "device": "00000000-0000-0000-d57d-f30cb6a89289",
//     "sim": 1,
//     "phone": "+251123456789",
//     "message": "Your OTP is {{otp}}"
// }

//    try {
//     const response =axios.post('https://hahu.io/api/send/otp',message) 
//     logMessage('SMS sent successfully:',response?.data);

//    } catch (error) {
//         logMessage('Failed to send SMS:', error);

//    }
  //   return message;
  // } catch (error:any) {
  //   console.log(error);
    
  //   logMessage('Failed to send SMS:', error);
  // }
}

