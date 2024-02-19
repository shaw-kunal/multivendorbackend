const express = require('express')
const UserModel = require('../model/UserModel');
const ErrorHandler = require('../utils/ErrorHandler');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const router = express.Router();


router.post("/create-user", async (req, res, next) => {

   const { name, email, password, avatar } = req.body;

   const userEmail = await UserModel.findOne({ email });

   if (userEmail) {
      return res.status(400).json({
         success: false,
         message: "User already exist"
      })
   }

   const user = {
      name,
      email,
      password,
      avatar: avatar || null
   }

   // sendling of mail
   const activationToken = createActivationToken(user);
   const activationUrl = `http://localhost:5173/activation/${activationToken}`
   try {
      await sendMail({
         email: user.email,
         subject: "Activate your account",
         message: `Hello ${user.name}, please click on the link to activate your account:${activationUrl}`
      })

      res.status(201).json({
         success: true,
         message: `please check your email :- ${user.email} to activate your account!`
      })

   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Internal server error"
      })
   }
})



// create activation token
const createActivationToken = (user) => {
   return jwt.sign(user, process.env.ACTIVATION_SECRET, {
      expiresIn: "7d"
   })
}





router.post('/activation/', catchAsyncErrors(async (req, res, next) => {
   try {

      const { activation_token } = req.body;
      const newUser = jwt.verify(
         activation_token,
         process.env.ACTIVATION_SECRET
      )
      if (!newUser) {
         return res.status(500).json({
            success: false,
            message: "Invalid Token"
         })
      }
      const user = await UserModel.create(newUser);
      sendToken(user, 201, res);
   } catch (error) {
      return next(new ErrorHandler(error.message, 500))
   }
}))





//login user

router.post("/login-user", catchAsyncErrors(async (req, res, next) => {
   try {

      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      console.log(user);

      if(!user) {
          return  res.status(500).json({
            message:"Try with different username or password"
          })
      }

        return res.status(200).json({
         success:true,
         message:"Login successfully"
        })






   } catch (error) {
      console.log(error)
   }

}))

module.exports = router;
