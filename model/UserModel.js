const { jwt } = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter your name!']
    },
    email: {
        type: String,
        required: [true, 'plase enter your email!']
    },
    password: {
        type: String,
        required: [true, "please enter your Password"],
        minLength: [4, "password should be greater than 4 characters"],
        select: false,
    },
    phoneNumber: {
        type: Number
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        default: "user"
    },
    addresses: [
        {
            country: { type: String },
            state: { type: String },
            city: { type: String },
            address1: { type: String },
            address2: { type: String },
            zipCode: { type: Number },
            addressType: { type: String }

        }
    ]

},
    {
        timestamps: true
    })


// hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        next();

    this.password = await bcrypt.hash(this.password, 10);
})





module.exports = mongoose.model("User", userSchema)