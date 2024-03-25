const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: ['true', "Please enter your Event name"]
    },

    description: {
        type: String,
        required: ['true', "Please enter your Event description"]
    },
    category: {
        type: String,
        required: ['true', "Please enter your Event category"]
    },
    startDate:{
       type:Date,
       required:true
    },
    endDate:{
        type:Date,
        required:true 
    },
    status:{
        type:String,
        default:"Running" 
    },
    tags: {
        type: String,
        required: ['true', "Please enter your Event tags"]
    },
    originalPrice: {
        type: Number,
    },
    discountPrice: {
        type: Number,
        required: ['true', "Please enter your product price"]
    },
    stock: {
        type: Number,
        required: ['true', "Please enter your product Stock"]
    },
    images:{
        type:[String],
    },
    shopId:{
        type:String,
        required:true
    },
    shop:{
        type:Object,
        required:true,
    },
    sold_out:{
        type:Number,
        default:0
    }

},
{timestamps:true})

module.exports = mongoose.model("Event",eventSchema)