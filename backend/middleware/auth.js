const ErrorHander = require("../utils/errorhander.js");
const catchAsyncErrors = require("./catchAsyncErrors.js")
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

exports.isAuthenticatedUser = catchAsyncErrors(async (req,res,next) => {
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHander("You need to login before accessing the resource", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id)

    next();
})

exports.authorizedRoles = (...roles) => { 
    return (req, res,next) => {
        if(!roles.includes(req.user.role)){
           return next(
            new ErrorHander(`You can't access this resource as ${req.user.role}`, 403)
           )
        }

        next();
    }
}