const express=require('express');
const session=require('express-session');
const path=require('path');
const User=require('../../seller/model/user');
const bcrypt=require('bcrypt');
const otputils=require('../../utils/otputils');
const {check ,validationResult}=require('express-validator');
exports.getSession = (req, res) => {
    if (req.session.isLoggedIn && req.session.user) {
        return res.json({
            isLoggedIn: true,
            role: req.session.user.role || "user"
        });
    }
    return res.json({ isLoggedIn: false, role: "user" });
};


exports.postLogin = async (req, res, next) => {
    try {
     
        const email = req.body.email?.toLowerCase().trim();
        const { password } = req.body;

        const user = await User.findOne({ email })
            .select('name email password address contactno role isVerified');
        console.log('user.password',user?.password);
        if (!user) {
            return res.status(422).json({ message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            req.session.pendingUserId = user._id.toString();
            return req.session.save((err) => {
                if (err) return next(err);
                return res.json({ redirect: "/sendotp" });
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(422).json({ message: "Invalid email or password" });
        }

        req.session.isLoggedIn = true;
        req.session.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            address: user.address,
            contactno: user.contactno,
            role: user.role
        };
        req.session.save((err) => {
            if (err) return next(err);
            res.json({ message: "Login successful", user: req.session.user });
        });

    } catch (err) {
        next(err);
    }
};


exports.postLogout=(req,res,next)=>{
    req.session.destroy(()=>{
        res.json({redirect:"/"});
    })
    
}


exports.signupuser=[
    check("name")
    .trim()
    .isLength({min:2})
    .withMessage("Name should be atleast 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name should only consists of alphabets"),

    check("password")
    .isLength({min:8})
    .withMessage("Password should be graeter than 7 characters")
    .matches(/[A-Z]/)
    .withMessage("Password should contain atleast 1 uppercase character ")
    .matches(/[a-z]/)
    .withMessage("Password should contain atleast 1 lowercase character")
    .matches(/[0-9]/)
    .withMessage("Password should contain atleast 1 number")
    .matches(/[!@#$%&*]/)
    .withMessage("Password should contain atleast 1 special character")
    .trim(),

    check("confirmpassword")
    .trim()
    .custom((value,{req})=>{
        if(value!==req.body.password){
            throw new Error("Password do not match");
        }
        return true;
    }),
    check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .customSanitizer(value=>value.toLowerCase().trim()),

    check("address")
    .trim()
    .isLength({min:4})
    .withMessage("Address should be atleast 4 characters long"),

    check("contactno")
    .isMobilePhone()
    .withMessage("Please enter a valid mobile no."),
    
    async(req,res,next)=>{
        console.log(req.body);
        const {name,password,email,address,contactno}=req.body;
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({message:errors.array().map(e=>e.msg)});
        }
        try{
            const existingByEmail = await User.findOne({email});
            const existingByPhone = await User.findOne({contactno});

            if(existingByEmail && existingByEmail.isVerified){
                return res.status(422).json({message:"Email already registered"});
            }
            if(existingByPhone && existingByPhone.isVerified){
                return res.status(422).json({message:"Mobile number already registered"});
            }

            if(existingByPhone && !existingByPhone.isVerified && (!existingByEmail || existingByEmail._id.toString() !== existingByPhone._id.toString())){
                return res.status(422).json({message:"This mobile number is pending verification on another signup. Please wait or use a different number."});
            }

            const hashedPassword=await bcrypt.hash(password,10);
            let user=existingByEmail;
            if(user){
                user.name=name;
                user.password=hashedPassword;
                user.address=address;
                user.contactno=contactno;
            }else{
                user=new User({name,password:hashedPassword,email,address,contactno});
            }
            await user.save();
            console.log("User saved:", user._id.toString());
            req.session.pendingUserId=user._id.toString();
            req.session.save((err)=>{
                if(err){
                    return next(err);
                }
                res.json({message:"Signup successful",redirect:"/sendotp"});
            });

        }catch(err){
            if (err.code === 11000) {
                const field = Object.keys(err.keyPattern)[0];
                return res.status(422).json({
                    message: `This ${field} is already in use. Please try a different one.`
                });
            }
            return res.status(422).json({message:err.message});
        }
    }
      
    
];

exports.getChangepassword=(req,res,next)=>{
    res.json({message:"Password changes successfully"});

};
exports.sendotp = async (req, res) => {
    console.log("sendotp session:", req.session.pendingUserId, req.session.user?._id);
    try {
        const { method ,email} = req.body; 
        const userId=req.session.pendingUserId||req.session.user?._id;  
        const user = userId
                    ?await User.findById(userId)
                    :await User.findOne({email});
        if(!user){
            return res.json({redirect:"Unauthorized",redirect:"/signup"
            });
        }
        const otp  = otputils.generateOTP();

        
        req.session.otp = {
            code:    otp,
            expiry:  Date.now() + 10 * 60 * 1000,   
            method,
            userId: user._id.toString(),
            purpose:req.session.pendingUserId?'signup':'changepassword'
        };

        if (method === 'email') {
            await otputils.sendEmailOTP(user.email, otp,req.session.otp.purpose);
            return res.json({
                method: 'email',
                hint:   user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),  
                purpose:req.session.otp.purpose
            });
        } else if (method === 'phone') {
            await otputils.sendSmsOTP(user.contactno, otp);
            return res.json({
                method: 'phone',
                hint:   user.contactno.slice(-3).padStart(user.contactno.length, '*'), 
                error:  null,
                purpose:req.session.otp.purpose
            });
        } else {
            return res.status(400).json({message:"Invalid method"});
        }

    } catch (err) {
        console.log("sending error:",err);
        res.status(500).json({message:err.message});
    }
};
exports.verifyotp = async (req, res) => {
    try {
        const { otp, newpassword, confirmpassword } = req.body;
        const sessionOtp = req.session.otp;

        if (!sessionOtp) {
            return res.json({ error: 'Session expired. Please request a new OTP.', method: '', purpose: '' });
        }
        if (Date.now() > sessionOtp.expiry) {
            req.session.otp = null;
            return res.json({ error: 'OTP has expired. Please request a new one.', method: sessionOtp.method, purpose: sessionOtp.purpose });
        }
        if (otp !== sessionOtp.code) {
            return res.json({ error: 'Incorrect OTP. Please try again.', method: sessionOtp.method, purpose: sessionOtp.purpose });
        }

        if (sessionOtp.purpose === 'signup') {
            const updatedUser = await User.findByIdAndUpdate(
                sessionOtp.userId, { isVerified: true }, { new: true }
            );
            req.session.otp = null;
            req.session.pendingUserId = null;
            req.session.isLoggedIn = true;
            req.session.user = {
                _id: updatedUser._id.toString(),
                name: updatedUser.name,
                email: updatedUser.email,
                address: updatedUser.address,
                contactno: updatedUser.contactno,
                role: updatedUser.role
            };
            return req.session.save((err) => {
                if (err) return res.status(500).json({ message: "Session error" });
                res.json({ message: "Account verified", redirect: "/" });
            });
        }

        if (sessionOtp.purpose === 'changepassword') {


            if (!newpassword) {
                req.session.otp.verified = true;
                return req.session.save((err) => {
                    if (err) return res.status(500).json({ message: "Session error" });
                    res.json({ otpVerified: true });
                });
            }

            
            if (newpassword !== confirmpassword) {
                return res.json({ error: 'Passwords do not match.', method: sessionOtp.method, purpose: sessionOtp.purpose });
            }
            if (newpassword.length < 8) {
                return res.json({ error: 'Password must be at least 8 characters.', method: sessionOtp.method, purpose: sessionOtp.purpose });
            }

            const hashed = await bcrypt.hash(newpassword, 10);
            await User.findByIdAndUpdate(sessionOtp.userId, { password: hashed });
            req.session.otp = null;
            return res.json({ message: "Password changed successfully", redirect: "/login" });
        }

        return res.status(400).json({ message: "Unknown OTP purpose." });

    } catch (err) {
        res.status(500).json({ message: "Session error. Please try again." });
    }
};


exports.postChangePassword = async (req, res, next) => {
    try {
        if (!req.session.isLoggedIn || !req.session.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(422).json({ message: "All fields are required." });
        }
        if (newPassword !== confirmPassword) {
            return res.status(422).json({ message: "New passwords do not match." });
        }
        if (newPassword.length < 8) {
            return res.status(422).json({ message: "Password must be at least 8 characters." });
        }

        const user = await User.findById(req.session.user._id).select('password');
        if (!user) return res.status(404).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(422).json({ message: "Incorrect current password." });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.session.user._id, { password: hashed });

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        next(err);
    }
};

