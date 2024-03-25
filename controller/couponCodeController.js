const express = require('express')
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const shopModel = require('../model/shopModel');
const couponCodeModel = require('../model/couponCodeModel');
const { isSeller } = require('../middleware/auth');
const router = express.Router()

//create Coupon code
router.post("/create-coupon-code", isSeller, catchAsyncErrors(async (req, res) => {
    try {
        const isCouponCodeExist = await couponCodeModel.find({ name: req.body.name })
        console.log("isCouponCode exist", isCouponCodeExist);
        if (isCouponCodeExist.length !== 0) {
            return res.status(400).json({
                success: false,
                message: "Coupon Code already Exist"
            })
        }

        const couponCode = await couponCodeModel.create({ ...req.body, "shop": req.seller, "shopId": req.seller._id });
        return res.status(200).json({
            success: true,
            message: "Successfully create Coupon Code",
            couponCode
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}))

//get all coupon code
router.get("/get-all-coupons", isSeller, catchAsyncErrors(async (req, res) => {
    try {

        const coupons = await couponCodeModel.find({ shopId: req.seller._id })
        return res.status(200).json({
            success: true,
            total: coupons.length,
            coupons
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }
}))


//delete a single coupon code
router.delete("/delete-coupon/:id", isSeller, catchAsyncErrors(async (req, res) => {
    try {
        const couponId = req.params.id;
        const coupon = await couponCodeModel.findByIdAndDelete(couponId)
        if (!coupon) {
            return res.status(400).json({
                message: `There is no Coupon available with ${productId}`,
                success: "false"
            })
        }
        return res.status(200).json({
            message: "Coupon delete sucessfully",
            success: "true"
        })

    } catch (error) {
        return res.status(400).json({
            message: "Internal server error",
            success: "false"
        })
    }
}))

//
// get coupon code value by its name

router.get("/get-coupon-value/:name", catchAsyncErrors(async (req, res) => {
    try {

        const couponCode = await couponCodeModel.findOne({ name: req.params.name });
        return res.status(200).json({
            success: true,
            couponCode
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message:error.message
        })
    }
}))

module.exports = router