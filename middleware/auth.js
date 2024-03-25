const UserModel = require("../model/UserModel");
const shopModel = require("../model/shopModel");
const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require('./catchAsyncErrors')
const jwt = require('jsonwebtoken')


exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return  res.status(401).json({
            success:false,
            message:"please login to continue"
        })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await UserModel.findById(decoded.id);
    next();
})

exports.isSeller= catchAsyncErrors(async (req,res,next)=>{
    const {seller_token} = req.cookies;
    console.log("seller_token>>",seller_token)
    if(!seller_token){
        return res.status(401).json({
            success:false,
            message:"Please login seller account"
        })
    } 

    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
    req.seller = await shopModel.findById(decoded.id);
    next();
})