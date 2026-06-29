const { Resend } = require('resend');
const twilio = require('twilio');

const resend = new Resend(process.env.RESEND_API_KEY);

const twilioClient = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendEmailOTP = async (toEmail, otp, purpose = 'changepassword') => {
    const isSignup = purpose === 'signup';
    await resend.emails.send({
        from: 'VibeVault <onboarding@resend.dev>',
        to: toEmail,
        subject: isSignup ? 'VibeVault - Verify Your Account' : 'VibeVault - OTP for Password Change',
        html: `
            <h2>VibeVault</h2>
            <p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this, ignore this email.</p>
        `
    });
};

exports.sendSmsOTP = async (toPhone, otp) => {
    await twilioClient.messages.create({
        body: `Your VibeVault OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE,
        to: `+91${toPhone}`
    });
};
