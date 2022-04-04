const express = require("express")
const router = express.Router();
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const {createOrder, getSingleOrderDetails, myOrders, getAllOrders, updateOrder, deleteOrder} = require("../controllers/orderController.js")

router.post("/order/new", isAuthenticatedUser, createOrder)
router.get("/orders/me", isAuthenticatedUser, myOrders)
router.get("/order/:orderId", isAuthenticatedUser, getSingleOrderDetails)


//Admin Routes
router.get("/admin/orders", isAuthenticatedUser, authorizedRoles("admin"), getAllOrders)
router.put("/admin/order/:orderId", isAuthenticatedUser, authorizedRoles("admin"), updateOrder)
router.delete("/admin/order/:orderId", isAuthenticatedUser, authorizedRoles("admin"), deleteOrder)


module.exports = router;