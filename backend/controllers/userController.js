const ErrorHander = require("../utils/errorhander")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel.js");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto")

//register a user
exports.registerUser = catchAsyncErrors(async(req,res,next) => {
    const {name, email, password} = req.body;
    
    const user = await User.create({
        name, email, password,
        avatar:{
            public_id:"sampleid",
            url:"dpurl"
        }
    });

    sendToken(user, 201, res);
})

//User Login
exports.loginUser = catchAsyncErrors(async(req,res,next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return next(new ErrorHander("Please provide email and password both", 400))
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHander("Invalid Email/Password Combination", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(isPasswordMatched == false){
        return next(new ErrorHander("Invalid Email/Password Combination", 400));
    }

    sendToken(user, 200, res);
})

//Logout Function
exports.logout = catchAsyncErrors(async(req,res,next) => {
    
    res.cookie("token", null, {
        expires: new Date(Date.now),
        httpOnly:true
    })
    
    res.status(200).json({
        success:true,
        message:"You have successfully logged out!"
    })
})

//Forgot Password
exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHander("Cant find user with provided email", 404))
    }

    //Getting Reset Password Token
    const resetToken = user.getPasswordResetToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/forgotpassword/${resetToken}`

    const message = `Your password reset token is : 
    
    ${resetPasswordUrl}

    Ignore if you have not requested it!
    `

    try{

        await sendEmail({
            email:user.email,
            subject:`Password Reset @ Ecom`,
            message,
        });

        res.status(200).json({
            success:true,
            message:`Email Sent to ${user.email}. Check your inbox`
        })

    } catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false});
        return next(new ErrorHander(error.message, 500))

    }
})  


exports.resetPassword = catchAsyncErrors(async(req,res,next) => {
    
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}, 
    })

    if(!user){
        return next(new ErrorHander("Reset Password token is invalid or has expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHander("Password doesnt match with confirm password!", 400))
    }
 
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    
    sendToken(user, 200 , res)

})

//Get User Deatils 
exports.getUserDetails = catchAsyncErrors(async(req,res,next) => {
    
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    })

})

//Update User Password 
exports.updatePassword = catchAsyncErrors(async(req,res,next) => {
    
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if(!isPasswordMatched){
        return next(new ErrorHander("Incorrect Old Password", 400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("Passwords don't match", 400));

    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res)

})

//Update User Profile 
exports.updateProfile = catchAsyncErrors(async(req,res,next) => {
    
    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }

    //Avatar Update Remaining

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    })


    res.status(200).json({
        success:true,
        message:"Profile Updated Successfully",
        user
    })

})

//Deleting Profile
exports.deleteProfile = catchAsyncErrors(async(req,res,next) => {
    
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.password)

    if(!isPasswordMatched){
        return next(new ErrorHander("Incorrect Password", 400));
    }

    await user.remove()

    res.status(200).json({
        success:true,
        message:`Profile Deleted Successfully. Sorry to see you go.`,
    })

})

//Get All Users --- Admin Function 
exports.getAllUsers = catchAsyncErrors(async(req,res,next) => {

    const users = await User.find();
    const usersCount = await User.countDocuments();

    res.status(200).json({
        success:true,
        users,
        usersCount
    })
}) 

//Get A single user --- Admin Function
exports.getSingleUser = catchAsyncErrors(async(req,res,next) => {
    
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`Invalid User ID : ${req.params.id}`, 400))
    }

    res.status(200).json({
        success:true,
        user
    })
})

//Update User Role --- Admin Function
exports.updateUserRole = catchAsyncErrors(async(req,res,next) => {
    
    const adminName = req.user.name;
    
    const newUserData = { 
        role:req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    })
    
    res.status(200).json({
        success:true,
        message:`Profile Updated Successfully By Admin --- ${adminName}`,
        user
    })

})

//Deleting User --- Admin Function
exports.deleteUserProfile = catchAsyncErrors(async(req,res,next) => {

    const adminName = req.user.name;
    
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`No User Found with ID : ${req.params.id}`, 400))
    }

    await user.remove()

    res.status(200).json({
        success:true,
        message:`Profile Deleted Successfully By Admin -- ${adminName}`,
    })

})