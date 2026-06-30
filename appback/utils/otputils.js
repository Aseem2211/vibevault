const axios = require('axios');
const twilio = require('twilio');

const twilioClient = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendEmailOTP = async (toEmail, otp, purpose = 'changepassword') => {
    const isSignup = purpose === 'signup';
    await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: 'VibeVault' },
        to: [{ email: toEmail }],
        subject: isSignup ? 'VibeVault - Verify Your Account' : 'VibeVault - OTP for Password Change',
        htmlContent: `
            <h2>VibeVault</h2>
            <p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this, ignore this email.</p>
        `
    }, {
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
        }
    });
};

exports.sendSmsOTP = async (toPhone, otp) => {
    await twilioClient.messages.create({
        body: `Your VibeVault OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE,
        to: `+91${toPhone}`
    });
};
