const mongoose  = require('mongoose')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter your name!']
    },
    email:{
        type:String,
        required:[true,'plase enter your email!']
    },
    password:{
        type:String,
        required:[true,"please enter your Password"],
        minLength:[4,"password should be greater than 4 characters"],
        select :false,
    },

    avatar:{
        type:String, 
     },
    role:{
        type:String,
        default:"user"
    },
    
},
{
    timestamps:true
})

module.exports = mongoose.model("User",userSchema)