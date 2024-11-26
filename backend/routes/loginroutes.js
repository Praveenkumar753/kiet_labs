const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a strong secret key

// Predefined login credentials
const predefinedEmail = 'pavankollim4@gmail.com';
const predefinedPassword = '12345';

// Temporary storage for OTPs
let otpStore = {};

// Nodemailer setup for sending OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'manaclglevelup@gmail.com', // Replace with your email
    pass: 'ljun fcdw uyli upzt', // Replace with your email password
  },
});



// OTP generation function
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Route for login (validates email and password)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === predefinedEmail && password === predefinedPassword) {
    const otp = generateOTP();
    otpStore[email] = otp;

    const mailOptions = {
      from: 'pavankolli7532@gmail.com',
      to: email,
      subject: 'Your OTP for login',
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).send('Error sending OTP');
      }
      res.status(200).send('OTP sent to your email');
    });
  } else {
    res.status(400).send('Invalid credentials');
  }
});

// Route for verifying OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] === otp) {
    delete otpStore[email]; // Remove OTP after successful verification

    // Generate JWT token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'OTP verified successfully', token });
  } else {
    res.status(400).send('Invalid OTP');
  }
});

module.exports = router;
