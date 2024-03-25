const express = require("express")
const router = express.Router();
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const shopModel = require("../model/shopModel");
const ProductModel = require("../model/ProductModel");
const { isSeller } = require("../middleware/auth");


//create Product
router.post("/createProduct", catchAsyncErrors(async (req, res, nex) => {
    try {

        const shopId = req.body.shopId;
        const shop = await shopModel.findById(shopId);
        if (!shop) {
            return res.status(400).json({
                message: "Invalid shop Id",
                success: "false"
            })
        }
        const product = await ProductModel.create({ ...req.body, shop })
        return res.status(201).json({
            success: true,
            product,
        });


    } catch (error) {
        return res.status(400).json({
            message: error.message,
            success: "false"
        })
    }
}))


//getAll products of a shop
router.get("/get-all-products-shop/:id", catchAsyncErrors(async (req, res) => {
    try {

        const products = await ProductModel.find({ shopId: req.params.id })
        return res.status(200).json({
            success: true,
            total: products.length,
            products
        })
    } catch (error) {
        return res.status(500).json({

            success: false,
            message: error.messages
        })
    }
}))

// delete shop product
router.delete("/delete-shop-product/:id", isSeller, catchAsyncErrors(async (req, res) => {

    try {

        const productId = req.params.id;
        const product = await ProductModel.findByIdAndDelete(productId);

        if (!product) {
            return res.status(400).json({
                message: `There is no product available with ${productId}`,
                success: "false"
            })
        }
        return res.status(200).json({
            message: "Product delete sucessfully",
            success: "true"
        })

    } catch (error) {
        console.log("error>>>", error)
        return res.status(400).json({
            message: "Internal server error",
            success: "false"
        })
    }
}))

// get best deal and related product
router.get("/", catchAsyncErrors(async (req, res) => {
    const { limit, category } = req.query;
    const limitValue = parseInt(limit, 10) || 40;
    console.log(category)
    try {
        let query = {};
        if ( category ) {
            console.log("not null")
            query.category = category;
        }
        // If category is null or undefined, no need to add it to the query
        
        const products = await ProductModel.find(query).limit(limitValue);
        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.log("error>>>", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}));



// delete all product of a particular shop
router.delete("/delete-all/:shopId", catchAsyncErrors(async (req, res) => {
    try {

        const { shopId } = req.params;
        const deleteProducts = await ProductModel.deleteMany({ shopId });
        res.status(200).json({ message: `Deleted ${deleteProducts.deletedCount} products.` });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}))


// get a single product 

router.get("/:productId", catchAsyncErrors(async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(400).json({
                message: "No product find with id",
                success: false
            })
        }

        return res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        return res.status(400).json({
            message: "Internal server error",
            success: "false"
        })
    }
}));



// get product count of a shop

router.get("/count/:shopId", catchAsyncErrors(async (req, res) => {
    try {
        const { shopId } = req.params;
        const productCount = await ProductModel.countDocuments({ shopId });

        res.status(200).json({ total: productCount });
    } catch (error) {
        return res.status(400).json({
            message: "Internal server error",
            success: false
        })
    }
}));


module.exports = router