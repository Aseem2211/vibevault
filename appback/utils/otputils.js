const nodemailer = require('nodemailer');
const twilio     = require('twilio');
const transporter = nodemailer.createTransport({
    host:'smpt.gmail.com',
    port:587,
    secure:false,
    family:4,
    auth: {
        user: process.env.EMAIL_USER,   
        pass: process.env.EMAIL_PASS,   
    }
});
const twilioClient = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.sendEmailOTP = async (toEmail, otp,purpose='changepassword') => {
    const isSignup=purpose=='signup';
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: isSignup?'VibeVault-Verify Your Account':'VibeVault - Your OTP for Password Change',
        html: `
            <h2>VibeVault Password Change</h2>
            <p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this, ignore this email.</p>
        `
    });
};
exports.sendSmsOTP = async (toPhone, otp) => {
    await twilioClient.messages.create({
        body: `Your VibeVault OTP for password change is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE,  
        to: `+91${toPhone}`              
    });
};