const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getTransport() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SERVICE,
  } = process.env;

  if (SMTP_SERVICE && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      service: SMTP_SERVICE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return null;
}

async function sendMail(toEmail, otp = generateOtp()) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (brevoApiKey) {
    if (!fromAddress) {
      throw new Error("SMTP_FROM is required when BREVO_API_KEY is configured");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromAddress },
        to: [{ email: toEmail }],
        subject: "Your OTP verification code",
        textContent: `Your OTP is ${otp}.`,
        htmlContent: `<p>Your OTP is <b>${otp}</b>.</p>`,
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Brevo API request failed (${response.status}): ${responseBody}`);
    }

    const result = await response.json();
    console.log("OTP email sent through Brevo API:", result.messageId || "accepted");
    return otp;
  }

  const transport = getTransport();
  if (!transport) {
    console.warn(
      `SMTP not configured. OTP for ${toEmail} is ${otp} (dev fallback).`
    );
    return otp;
  }

  const info = await transport.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: "Your OTP verification code",
    text: `Your OTP is ${otp}.`,
    html: `<p>Your OTP is <b>${otp}</b>.</p>`,
  });

  console.log("OTP email sent:", info.messageId);
  return otp;
}

module.exports = {
  sendMail,
  generateOtp,
};
