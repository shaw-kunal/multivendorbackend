const express = require("express");
const ErrorHandler = require("./utils/ErrorHandler");
const dotenv = require("dotenv")
const cookieParser = require('cookie-parser')
const cors =require('cors')



//import routes
const user = require("./controller/userController");
const { upload } = require("./mutlter");



const app = express();
app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use("/",express.static("uploads"));
app.use(express.urlencoded({ extended: true }));


app.post("/upload",upload.single("file"),(req,res)=>{
    console.log('hel')
    res.status(200).json("File has been uploadeds")
})
app.use("/api/v2/user",user);



//config the .env file
dotenv.config({
    path: "config/.env"
})
















// it's for error handlin
app.use(ErrorHandler)

module.exports = app

