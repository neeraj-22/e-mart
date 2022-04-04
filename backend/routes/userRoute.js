const express = require("express")
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUserProfile, deleteProfile } = require("../controllers/userController")
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth")
const router = express.Router()

//Login Routes
router.post("/signup", registerUser)
router.post("/signin", loginUser)
router.get("/signout", logout)

//Password Routes
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:token", resetPassword)
router.put("/profile/changepassword", isAuthenticatedUser, updatePassword)

//Profile Routes
router.get("/profile", isAuthenticatedUser, getUserDetails)
router.put("/profile/update", isAuthenticatedUser, updateProfile)
router.delete("/profile/deactivate", isAuthenticatedUser, deleteProfile)

//Admin Routes
router.get("/admin/users", isAuthenticatedUser, authorizedRoles("admin"), getAllUsers)
router.get("/admin/user/:id", isAuthenticatedUser, authorizedRoles("admin"), getSingleUser)
router.put("/admin/user/:id", isAuthenticatedUser, authorizedRoles("admin"), updateUserRole)
router.delete("/admin/user/:id", isAuthenticatedUser, authorizedRoles("admin"), deleteUserProfile)

module.exports = router