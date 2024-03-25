const express = require("express");
const ErrorHandler = require("./utils/ErrorHandler");
const dotenv = require("dotenv")
const Razorpay = require("razorpay")
const cookieParser = require('cookie-parser')
const cors = require('cors')



//import routes
const user = require("./controller/userController");
const shop = require("./controller/shopController");
const product = require("./controller/productController");
const event = require("./controller/eventController");
const coupon = require("./controller/couponCodeController");
const order = require("./controller/orderController");
const { upload } = require("./mutlter");


const app = express();
app.use(cookieParser())


//config the .env file
dotenv.config({
    path: "config/.env"
})




app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", 'GET', "DELETE", 'PUT'],
    credentials: true
}))
// app.use(cors())
app.use(express.json())
app.use("/", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));




// get key
app.get("/api/v2/getKey",(req,res)=>{
    res.status(200).json({key:process.env.RAZOR_API_KEY})
})






// Serve the "uploads" folder as static content
app.use("/uploads", express.static("uploads"));



app.post("/uploads", upload.single("file"), (req, res) => {
    res.status(200).json("File has been uploadeds")
})

app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product)
app.use("/api/v2/event", event)
app.use("/api/v2/coupon", coupon)
app.use("/api/v2/order", order)

















// it's for error handlin
app.use(ErrorHandler)

module.exports = app

