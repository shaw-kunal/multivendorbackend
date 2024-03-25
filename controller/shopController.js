const express = require('express');
const shopModel = require('../model/shopModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sendToken = require('../utils/jwtToken');
const sendMail = require('../utils/sendMail');
const bcrypt = require("bcryptjs");
const sendShopToken = require('../utils/shopToken');
const { isAuthenticated, isSeller } = require('../middleware/auth');


router.post("/create-shop", async (req, res) => {

    try {

        const { email } = req.body;

        const user = req.body;
        console.log(req.body)

        const sellerEmail = await shopModel.findOne({ email });
        if (sellerEmail) {
            return res.status(500).json({
                success: false,
                message: "User already exist"
            })
        }



        const activationToken = createActivationToken(user);

        const activationUrl = `http://localhost:5173/seller/activation/${activationToken} t`
        try {
            await sendMail({
                email: user.email,
                subject: "Activate your shop account",
                message: `Hello ${user.name}, please click on the link to activate your account:${activationUrl}`
            })

            res.status(201).json({
                success: true,
                message: `please check your email :- ${user.email} to activate your shop account!`
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error
            })
        }


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error
        })
    }
})




// create activation token
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "7d"
    })
}


//activate seller

router.post("/activation", catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("this is seller")
        const { activation_token } = req.body;
        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

        if (!newUser) {
            return res.status(500).json({
                success: false,
                message: "Invalid Token"
            })
        }

        const user = await shopModel.create(newUser);
        sendToken(user, 201, res);

    } catch (error) {

        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })


    }
}))


//login shop
router.post("/login-shop", catchAsyncErrors(async (req, res, next) => {
    try {

        console.log("shop login")
        const { email, password } = req.body;

        const user = await shopModel.findOne({ email }).select("+password")
        console.log(user)
        if (!user) {
            return res.status(500).json({
                success: false,
                message: "User doest not exist"
            })
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log(isValidPassword)
            return res.status(401).json({
                success: false,
                message: "You are not authenticated"
            })
        }

        sendShopToken(user, 201, res);

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Internal server error"
        })

    }
}))

//load-shop



router.get("/getSeller",isSeller,catchAsyncErrors(async(req,res,next)=>{
    try {
        
        console.log(req.seller)
        const seller  = await shopModel.findById(req.seller.id);
       if(!seller){
          return res.status(500).json({
            success:false,
            message:"Seller's does not exist"
          });
       }
       res.status(200).json({
          success:true,
          seller,
       })
    } catch (error) {
       return  res.status(500).json({
        success:false,
        message:error.message,
     })
       
    }
 }))
 

 
//logout seller

router.get("/logout",isSeller ,catchAsyncErrors(async(req,res,next)=>{
    try {
       console.log("call in data")
       res.cookie("seller_token",null,{
          expires:new Date(Date.now()),
          httpOnly:true
       })
       
       res.status(201).json({
          success:true,
          message: "Log Out Succesflly"
       })
 
    } catch (error) {
        return  res.status(500).json({
          success:false,
          message:error.message|| "Internal server error"
        })
    }
 }))
 

 //get seller info

router.get("/:id",catchAsyncErrors(async(req,res)=>{
    try {
        
        const shopId = req.params.id;
        const seller  = await shopModel.findById(shopId);
       if(!seller){
          return res.status(500).json({
            success:false,
            message:"Seller's does not exist",
            seller
          });
       }
       res.status(200).json({
          success:true,
          seller,
       })
    } catch (error) {
       return  res.status(500).json({
        success:false,
        message:error.message,
     })
       
    }
 }))
 



module.exports = router;
