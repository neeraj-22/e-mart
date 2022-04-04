const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxLength:[30,"Cant exceed 30 chars"],
        minLength:[5,"Should be more than 4 chars"]
    },
    
    email:{
        type:String,
        required:[true,"Please provide your email"],
        unique:true,
        validate:[validator.isEmail, "Please enter a valid email"]
    },

    password:{
        type:String,
        minLength:[8,"Password should be greater than 8 chars"],
        select:false,
        required:true
    },

    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            require:true
        }
    },

    role:{
        type:String,
        default:"user"
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password,10)
})

//JWT Token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRE
    })
}

//Compare Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

//Generating Password Reset Token
userSchema.methods.getPasswordResetToken = function(){

    const resetToken = crypto.randomBytes(20).toString("hex")
   
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15*60*1000;

    return resetToken;

}

module.exports = mongoose.model("User", userSchema)