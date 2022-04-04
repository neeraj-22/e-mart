const Order = require("../models/orderModel.js")
const Product = require("../models/productModel.js")
const ErrorHander = require("../utils/errorhander")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//Create New Order
exports.createOrder = catchAsyncErrors(async (req,res,next) => {
    
    const {shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body
    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });

    res.status(201).json({
        success:true,
        order
    })
})

//Get A single order details 
exports.getSingleOrderDetails = catchAsyncErrors(async(req,res,next)=> {
    const order = await Order.findById(req.params.orderId).populate("user", "name email");

    if(!order){
        return next(new ErrorHander("Order Not Found with given Id", 404))
    }

    res.status(200).json({
        success : true,
        order
    })
})


//Get all orders of a user
exports.myOrders = catchAsyncErrors(async(req,res,next)=> {
    const orders = await Order.find({user : req.user._id})

    res.status(200).json({
        success : true,
        orders
    })
})

//Get all orders --- Admin Function
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=> {
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount+=order.totalPrice
    });

    res.status(200).json({
        success : true,
        totalAmount,
        orders
    })
})

//Update Order Status --- Admin Function
exports.updateOrder = catchAsyncErrors(async(req,res,next)=> {
    const order = await Order.findById(req.params.orderId)

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHander("Order has already been delivered", 400));
    }

    order.orderItems.forEach(async (key) => {
        await updateStock(key.product, key.quantity)
    })

    order.orderStatus =  req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now()
    }

    await order.save({validateBeforeSave:false})
    res.status(200).json({
        success : true,
        order
    })
})

async function updateStock(productId, quantity){
    const product = await Product.findById(productId);

    if(!order){
        return next(new ErrorHander("Order Not Found with given Id", 404))
    }
    
    product.Stock -= quantity;

    await product.save({validateBeforeSave:false})
}

//Delete order --- Admin Function
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=> {

    const order = await Order.findById(req.params.orderId)

    if(!order){
        return next(new ErrorHander("Order Not Found with given Id", 404))
    }

    await order.remove()

    res.status(200).json({
        success : true,
    })
})