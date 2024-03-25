const { jwt } = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");


const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter your shop name!']
    },
    email: {
        type: String,
        required: [true, 'plase enter your shop email!']
    },
    password: {
        type: String,
        required: [true, "please enter your Password"],
        minLength: [4, "password should be greater than 4 characters"],
        select: false,
    },
    description: {
        type: String,

    },
    rating:{
        type:Number
    },
    address: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        default: "Seller"
    },
    zipcode: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,


},
    {
        timestamps: true
    },
)


// hash password
shopSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        next();

    this.password = await bcrypt.hash(this.password, 10);
})





module.exports = mongoose.model("Shop", shopSchema)