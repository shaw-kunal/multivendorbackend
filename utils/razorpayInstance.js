const dotenv = require("dotenv")
const Razorpay = require("razorpay")
dotenv.config({
    path: "config/.env"
})




// export the rajor pay key
const instance = new Razorpay({
    key_id: process.env.RAZOR_API_KEY,
    key_secret: process.env.RAZOR_API_SECRET,
})

module.exports = instance


