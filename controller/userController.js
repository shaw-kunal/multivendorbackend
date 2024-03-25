const express = require('express')
const UserModel = require('../model/UserModel');
const ErrorHandler = require('../utils/ErrorHandler');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const router = express.Router();
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require('../middleware/auth');



router.post("/create-user", async (req, res, next) => {
   const { name, email, password, avatar } = req.body;
   console.log("body>>", req.body)

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
      console.log(error)
      res.status(500).json({
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
      return res.status(500).json({
         message: error.message,
         success: false
      })
   }
}))





//login user

router.post("/login-user", catchAsyncErrors(async (req, res, next) => {
   try {

      const { email, password } = req.body;
      const user = await UserModel.findOne({ email }).select("+password");
      console.log(user);

      if (!user) {
         return res.status(500).json({
            message: "Try with different username or password"
         })
      }


      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
         return res.status(401).json({
            success: false,
            message: "You are not authenticated"
         })
      }

      sendToken(user, 201, res);

   } catch (error) {
      console.log(error)
      res.status(500).json({
         success: false,
         error: error.message
      })
   }

}))



//load user


router.get("/getuser", isAuthenticated, catchAsyncErrors(async (req, res, next) => {
   try {

      const user = await UserModel.findById(req.user.id);
      console.log("user >>", user)
      if (!user) {
         return next(new ErrorHandler("User does't exist", 400));
      }
      res.status(200).json({
         success: true,
         user,
      })
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      })

   }
}))



//logout user

router.get("/logout", isAuthenticated, catchAsyncErrors(async (req, res, next) => {
   try {
      console.log("call in data")
      res.cookie("token", null, {
         expires: new Date(Date.now()),
         httpOnly: true
      })

      res.status(201).json({
         success: true,
         message: "Log Out Succesflly"
      })

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message || "Internal server error"
      })
   }
}))



// user updation

router.put("/", isAuthenticated, catchAsyncErrors(async (req, res) => {
   const id = req.user._id;
   console.log("updated user", req.body)
   try {
      const user = await UserModel.findByIdAndUpdate(id, req.body, { new: true });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         })
      }
      return res.status(200).json({
         success: true,
         message: "User successfully Updated",
         user
      })

   } catch (error) {
      res.status(404).json({
         success: false,
         message: "User not found"
      })
   }
}))


// update user address

router.put("/update-user-address", isAuthenticated, catchAsyncErrors(async (req, res) => {
   try {

      const user = await UserModel.findById(req.user.id);
      const sametypeAddress = user.addresses.find(address => address.addressType === req.body.addressType)
      if (sametypeAddress) {
         return res.status(400).json({
            success: false,
            message: `${req.body.addressType} address already exists`
         })
      }

      const existAddress = user.addresses.find(address => address._id === req.body._id)
      if (existAddress) {
         Object.assign(existAddress, req.body);
      }
      else {
         user.addresses.push(req.body);
      }
      const updatedUser = await user.save();
      res.status(200).json({
         success: true,
         message: "Address saved successfully!",
         updatedUser

      })
   } catch (error) {
      res.status(500).json({
         success: true,
         message: error.message
      })
   }
}))



// delete the user address
router.delete("/delete-user-address/:id", isAuthenticated, catchAsyncErrors(async (req, res) => {
   try {

      const userId = req.user._id;
      const addressId = req.params.id;

      await UserModel.updateOne({ _id: userId }, { $pull: { addresses: { _id: addressId } } });
      const updatedUser = await UserModel.findById(userId);

      res.status(200).json({
         success: true,
         message: "Successfully deleted",
         user: updatedUser
      })

   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message
      })

   }
}))

// change the user password

router.post("/update-user-password", isAuthenticated, catchAsyncErrors(async (req, res) => {
   try {
      const { oldPassword, newPassword } = req.body;
      const user = await UserModel.findById(req.user._id).select("+password")
      const isCorrectPassword = bcrypt.compare(oldPassword, user.password);
      if (!isCorrectPassword) {
         return res.status(400).json({
            success: false,
            message: "Old password is not correct"
         })
      }


      user.password = req.body.newPassword;
      await user.save();

      res.status(200).json({
         success: true,
         message: "Password updated"
      })
   } catch (error) {

      res.status(400).json({
         success: false,
         message: error.message
      })
   }
}))




module.exports = router;
