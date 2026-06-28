const User = require('../../seller/model/user');
const bcrypt = require('bcrypt');
const otputils = require('../../utils/otputils');


exports.sendChangePasswordOTP = async (req, res) => {
    try {
        const { method, email } = req.body;

        
        const userId = req.session.user?._id;
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({ email: email?.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: "No account found with that email." });
        }

        const otp = otputils.generateOTP();
        req.session.otp = {
            code:    otp,
            expiry:  Date.now() + 10 * 60 * 1000,
            method,
            userId:  user._id.toString(),
            purpose: 'changepassword',
            verified: false,
        };

        if (method === 'email') {
            await otputils.sendEmailOTP(user.email, otp, 'changepassword');
            return req.session.save((err) => {
                if (err) return res.status(500).json({ message: "Session error" });
                res.json({
                    method: 'email',
                    hint: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
                });
            });
        }

        if (method === 'phone') {
            await otputils.sendSmsOTP(user.contactno, otp);
            return req.session.save((err) => {
                if (err) return res.status(500).json({ message: "Session error" });
                res.json({
                    method: 'phone',
                    hint: user.contactno.slice(-3).padStart(user.contactno.length, '*'),
                });
            });
        }

        return res.status(400).json({ message: "Invalid method. Use 'email' or 'phone'." });

    } catch (err) {
        console.error('sendChangePasswordOTP error:', err);
        res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }
};


exports.verifyChangePasswordOTP = async (req, res) => {
    try {
        const { otp, newpassword, confirmpassword } = req.body;
        const sessionOtp = req.session.otp;

        if (!sessionOtp || sessionOtp.purpose !== 'changepassword') {
            return res.json({ error: 'Session expired. Please request a new OTP.' });
        }
        if (Date.now() > sessionOtp.expiry) {
            req.session.otp = null;
            return res.json({ error: 'OTP has expired. Please request a new one.' });
        }

        if (!sessionOtp.verified && otp !== sessionOtp.code) {
            return res.json({ error: 'Incorrect OTP. Please try again.' });
        }

        if (!newpassword) {
            req.session.otp.verified = true;
            return req.session.save((err) => {
                if (err) return res.status(500).json({ message: "Session error" });
                res.json({ otpVerified: true });
            });
        }

     
        if (newpassword !== confirmpassword) {
            return res.json({ error: 'Passwords do not match.' });
        }
        if (newpassword.length < 8) {
            return res.json({ error: 'Password must be at least 8 characters.' });
        }

        const hashed = await bcrypt.hash(newpassword, 10);
        await User.findByIdAndUpdate(sessionOtp.userId, { password: hashed });
        req.session.otp = null;

        return req.session.save((err) => {
            if (err) return res.status(500).json({ message: "Session error" });
            res.json({ message: "Password changed successfully" });
        });

    } catch (err) {
        console.error('verifyChangePasswordOTP error:', err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};

exports.changePasswordWithOld = async (req, res) => {
    try {
        if (!req.session.isLoggedIn || !req.session.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { oldpassword, newpassword, confirmpassword } = req.body;

        if (!oldpassword || !newpassword || !confirmpassword) {
            return res.status(422).json({ message: "All fields are required." });
        }
        if (newpassword !== confirmpassword) {
            return res.status(422).json({ message: "Passwords do not match." });
        }
        if (newpassword.length < 8) {
            return res.status(422).json({ message: "Password must be at least 8 characters." });
        }

        const user = await User.findById(req.session.user._id).select('password');
        if (!user) return res.status(404).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isMatch) {
            return res.status(422).json({ message: "Incorrect current password." });
        }

        const hashed = await bcrypt.hash(newpassword, 10);
        await User.findByIdAndUpdate(req.session.user._id, { password: hashed });

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        console.error('changePasswordWithOld error:', err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};