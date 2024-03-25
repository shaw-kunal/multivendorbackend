const mongoose = require("mongoose")

const couponCodeSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter you coupon code!"],
        unique:true
    },
    value:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
    },
    maxAmount:{
        type:Number
    },
    category:[String],
    shopId:{
        type:String,
        required:true
    },
    shop:{
        type:Object,
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model("CouponCode",couponCodeSchema);