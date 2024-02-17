const express = require('express')
const UserModel = require('../model/UserModel');
const ErrorHandler = require('../utils/ErrorHandler');
const { upload } = require('../mutlter');
const router = express.Router();


router.post("/create-user", async (req,res,next)=>{

const {name,email,password,avatar}= req.body;




const userEmail = await UserModel.findOne({ email });
if (userEmail) {
 return next(new ErrorHandler("User already exists", 400));
}


    
    const user={
      name,
      email,
      password,
      avatar:avatar|| null
   }


     try {
        const newUser = await UserModel.create(user) 
        console.log(newUser)
        return res.status(201).send({
          success:true,
          newUser
        })
     } catch (error) {
        return next(new ErrorHandler(error.message,500))
     }

    

  
       
})
module.exports = router;




/* 




*/