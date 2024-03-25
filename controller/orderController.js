const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const orderModal = require("../model/orderModal");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const instance = require("../utils/razorpayInstance");
const crypto = require('crypto')

router.post(
    "/create-order",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        try {
            const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

            // group cart item by shop id
            const shopItemsMap = new Map();
            for (const item of cart) {
                const shopId = item.shopId;
                if (!shopItemsMap.has(shopId)) {
                    shopItemsMap.set(shopId, []);
                }
                shopItemsMap.get(shopId).push(item);
            }
            // create  an orders for each shop
            const orderIds = [];
            for (const [shopId, items] of shopItemsMap) {
                // console.log("items",items)
                const amount = items.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);
                const order = await orderModal.create({
                    cart: items,
                    shippingAddress,
                    user,
                    totalPrice: amount,
                    paymentInfo
                });
                orderIds.push(order._id);
            }

            const options = {
                amount: Number(req.body.totalPrice * 100),
                currency: 'INR',
            }


            const order = await instance.orders.create(options)

            res.status(200).json({
                success: true,
                order,
                orderIds
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                error: error,
            });
        }
    })
);


// payment verification
router.post("/paymentverification", catchAsyncErrors(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderIds } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZOR_API_SECRET)
        .update(body.toString())
        .digest("hex");

    console.log("sig recieved", razorpay_signature);
    console.log("sign generated", expectedSignature);

    const isAuthentic = expectedSignature === razorpay_signature;

    try {
        if (isAuthentic) {
            // Update payment information and paidAt field for each orderId
            const updatePromises = orderIds.map(async (orderId) => {
                await orderModal.findByIdAndUpdate(orderId, {
                    $set: {
                        "paymentInfo.id": razorpay_payment_id,
                        "paymentInfo.status": "Paid", // Assuming payment is successful
                        "paymentInfo.type": "Razorpay",
                        "paidAt": new Date() // Update paidAt to current timestamp
                    }
                });
            });

            // Wait for all updates to complete
            await Promise.all(updatePromises);

            res.status(200).json({
                success: true,
                payment_id: razorpay_payment_id
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}));
// Route to fetch orders of a specific user by userId
router.get('/orders/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch orders of the specific user from the database with specific fields
        const orders = await orderModal.find({ 'user._id': userId }, 'totalPrice createdAt orderStatus _id');

        // Check if there are any orders for the specific user
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for the user' });
        }

        // Send the fetched orders as response
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// all order of a spefic shop

router.get("/:shopId/orders", async (req, res) => {

    try {
        const shopId = req.params.shopId;
        const orders = await orderModal.find({ "cart.shop._id": shopId });
        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log("error>>>", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
})


//get a spefic order

router.get("/get-order/:orderId", async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderModal.findById(orderId)
        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.log("error>>>", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
})




module.exports = router;
