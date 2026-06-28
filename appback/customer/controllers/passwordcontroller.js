const bcrypt    = require('bcrypt');
const User      = require('../../seller/model/user');
const otputils  = require('../../utils/otputils');


exports.getchangepassword = (req, res) => {
    res.json({ error: null, success: null });
};


exports.changebyoldpassword = async (req, res) => {
    try {
        const { oldpassword, newpassword, confirmpassword } = req.body;

        if (newpassword !== confirmpassword) {
            return res.json({
                message: 'New passwords do not match', success: null
            });
        }
        const user = await User.findById(req.session.user._id);
        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isMatch) {
            return res.json({
                message: 'Old password is incorrect', success: null
            });
        }
        const hashed = await bcrypt.hash(newpassword, 10);
        await User.findByIdAndUpdate(req.session.user._id, { password: hashed });

        res.json({
            message: null, success: 'Password changed successfully!'
        });
    } catch (err) {
        res.status(500).json({message:"Invalid password"});
    }
};


exports.sendotp = async (req, res) => {
    try {
        const { method } = req.body;   
        const user = await User.findById(req.session.user._id);
        const otp  = otputils.generateOTP();
        req.session.otp = {
            code:    otp,
            expiry:  Date.now() + 10 * 60 * 1000,   
            method,
            userId:  req.session.user._id,
            purpose: 'changepassword'
        };
        if (method === 'email') {
            await otputils.sendEmailOTP(user.email, otp);
            return res.json({
                method: 'email',
                hint:   user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),  
                error:  null,
                purpose: 'changepassword'
            });
        } else if (method === 'phone') {
            await otputils.sendSmsOTP(user.contactno, otp);
            return res.json({
                method: 'phone',
                hint:   user.contactno.slice(-3).padStart(user.contactno.length, '*'), 
                error:  null,
                purpose:'changepassword'
            });
        } else {
            return res.json({redirect:'/changepassword'});
        }
    } catch (err) {
        res.status(500).json({message:"Error sending: OTP"});
    }
};


exports.verifyotp = async (req, res) => {
    try {
        const { otp, newpassword, confirmpassword } = req.body;
        const sessionOtp = req.session.otp;

        if (!sessionOtp) {
            return res.json({
                method: '', hint: '',
                error: 'Session expired. Please request a new OTP.',
                purpose:'changepassword'
            });
        }
        if (Date.now() > sessionOtp.expiry) {
            req.session.otp = null;
            return res.json({
                method: sessionOtp.method, hint: '',
                error: 'OTP has expired. Please request a new one.',
                purpose:'changepassword'
                
            });
        }
        if (otp !== sessionOtp.code) {
            return res.json({
                method: sessionOtp.method, hint: '',
                error: 'Incorrect OTP. Please try again.',
                purpose:'changepassword'
            });
        }
        if (newpassword !== confirmpassword) {
            return res.json({
                method: sessionOtp.method, hint: '',
                error: 'New passwords do not match.',
                purpose:'changepassword'
            });
        }
        const hashed = await bcrypt.hash(newpassword, 10);
        await User.findByIdAndUpdate(sessionOtp.userId, { password: hashed });

        req.session.otp = null;   

        res.json({redirect:"/profile"}); 

    } catch (err) {
        res.status(500).json({message:"Error verifying OTP: "});
    }
};