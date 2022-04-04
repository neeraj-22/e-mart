const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require("../controllers/productController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();
 
router.get("/products", getAllProducts) 
router.get("/product/:id", getProductDetails)
router.put("/review", isAuthenticatedUser, createProductReview)
router.get("/reviews", getProductReviews)
router.delete("/reviews", isAuthenticatedUser, deleteReview)

//Admin Routes
router.post("/admin/product/createproduct", isAuthenticatedUser, authorizedRoles("admin"), createProduct)
router.put("admin/product/:id", isAuthenticatedUser, authorizedRoles("admin"), updateProduct) 

module.exports = router