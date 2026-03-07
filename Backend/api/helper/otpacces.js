const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sendMail = require('./emailr');
const cors = require('cors')
app.use(bodyParser.json());
var Realotp=0;
app.use(cors());
app.post('/otpToEmail', async (req, res) => {
    try {
        const { email } = req.body;

        // Declare Realotp variable outside the try block
   

        async function sendVerificationEmail() {
            try {
                // Assign the value to Realotp
                Realotp = await sendMail(email);
               

                // You can perform other actions with Realotp here if needed
            } catch (error) {
                console.error('Error sending verification email:', error);
            }
        }

        await sendVerificationEmail();

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Error sending verification email:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/verify-otp', (req, res) => {
    const { otp } = req.body;


  
    // Verify the entered OTP
    const isOtpValid = otp == Realotp;


    if (isOtpValid) {
        // If OTP is valid, proceed with the desired action
        res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        // If OTP is invalid, notify the user
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
