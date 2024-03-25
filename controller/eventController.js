const express = require('express')
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const shopModel = require('../model/shopModel');
const eventModel = require('../model/eventModel');
const { isSeller } = require('../middleware/auth');
const router = express.Router()

// create event
router.post("/create-event", catchAsyncErrors(async (req, res, next) => {
    try {
        const shopId = req.body.shopId;
        const shop = await shopModel.findById(shopId);
        console.log("shop>>", shop)
        if (!shop) {
            return res.status(400).json({
                status: false,
                message: "shop Id is Invalid jls"
            })
        }
        const event = await eventModel.create({ ...req.body, shop })
        res.status(201).json({
            success: true,
            event,
        });
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: error.message
        })
    }
}))


//get all events by shop id
router.get("/get-all-events/:id", catchAsyncErrors(async (req, res, next) => {
    try {

        const events = await eventModel.find({ shopId: req.params.id })

        return res.status(200).json({
            success: true,
            total: events.length,
            events
        })
    } catch (error) {
        return res.status(500).json({

            success: false,
            message: error.messages
        })
    }
}))

//delete a events

router.delete("/delete-event/:id", isSeller, catchAsyncErrors(async (req, res, next) => {

    try {

        const eventId = req.params.id;
        const event = await eventModel.findByIdAndDelete(eventId);

        if (!event) {
            return res.status(400).json({
                message: `There is no product available with ${eventId}`,
                success: "false"
            })
        }
        return res.status(200).json({
            message: "Product delete sucessfully",
            success: "true"
        })

    } catch (error) {
        return res.status(400).json({
            message: error.message,
            success: "false"
        })
    }

}))


// get all  event
router.get("/get-all-events",catchAsyncErrors(async (req, res) => {
    try {

        const { limit } = req.query;
        const limitValue = parseInt(limit, 10)

        let events;
        if (limit) {
            events = await eventModel.find().limit(limitValue)
        } else {
            events = await eventModel.find();
        }
        return res.status(200).json({
            success: true,
            total: events.length,
            events
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.messages
        })

    }
}))

module.exports = router

