const express = require('express');
let a =require('dotenv').config({path:'../.env'});

const SendOtp = require('sendotp');
const bodyParser = require('body-parser');
const sendOtp = new SendOtp('AuthKey');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define a route to handle feedback form submissions
 console.log(a);
app.post('/submit-feedback', (req, res) => {
  // Access the submitted form data
  const feedbackData = req.body;

  // Perform actions with the feedback data (e.g., store in a database, process it, etc.)
  // For demonstration purposes, log the received data to the console
  console.log('Received feedback:', feedbackData);

  // Send a response to the client
  res.status(200).json({ message: 'Feedback received successfully!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
