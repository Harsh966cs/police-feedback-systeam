const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connect = require("../dbConfig/mongodb");
const { feedbackModel } = require("../model/FDForDbModel");
const { sendMail, generateOtp } = require("./helper/emailr");

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = new Map();
let dbAvailable = false;
const OTP_TTL_MS = Number(process.env.OTP_TTL_MS || 5 * 60 * 1000);
const OTP_RESEND_MS = Number(process.env.OTP_RESEND_MS || 60 * 1000);
const OTP_MAX_VERIFY_ATTEMPTS = Number(process.env.OTP_MAX_VERIFY_ATTEMPTS || 5);
const OTP_DEBUG_RESPONSE = process.env.OTP_DEBUG_RESPONSE === "true";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || "";
let recaptchaSkipWarned = false;

connect().then((ok) => {
  dbAvailable = ok;
});

function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (!entry || now > entry.expiresAt) {
      otpStore.delete(email);
    }
  }
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyRecaptcha(token, remoteIp) {
  if (!RECAPTCHA_SECRET) {
    if (!recaptchaSkipWarned) {
      recaptchaSkipWarned = true;
      console.warn("RECAPTCHA_SECRET not set. Skipping server-side reCAPTCHA verification.");
    }
    return true;
  }

  if (!token) {
    return false;
  }

  if (typeof fetch !== "function") {
    console.error("Global fetch is unavailable. Use Node.js 18+ for reCAPTCHA verification.");
    return false;
  }

  try {
    const body = new URLSearchParams();
    body.append("secret", RECAPTCHA_SECRET);
    body.append("response", token);
    if (remoteIp) {
      body.append("remoteip", remoteIp);
    }

    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      }
    );
    const result = await recaptchaResponse.json();
    return Boolean(result?.success);
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error.message);
    return false;
  }
}

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    dbAvailable,
    timestamp: new Date().toISOString(),
  });
});

app.post("/otp/send", async (req, res) => {
  try {
    cleanupExpiredOtps();
    const { email } = req.body || {};
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required." });
    }

    const now = Date.now();
    const existing = otpStore.get(email);
    if (existing && now - existing.lastSentAt < OTP_RESEND_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_MS - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
      });
    }

    const otp = generateOtp();
    const expiresAt = now + OTP_TTL_MS;
    otpStore.set(email, { otp, expiresAt, attempts: 0, lastSentAt: now });
    const deliveredOtp = await sendMail(email, otp);
    const responsePayload = {
      message: "OTP sent successfully",
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    };
    if (OTP_DEBUG_RESPONSE) {
      responsePayload.debugOtp = String(deliveredOtp);
    }
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/otp/verify", (req, res) => {
  cleanupExpiredOtps();
  const { email, otp } = req.body || {};
  if (!isValidEmail(email) || !otp) {
    return res.status(400).json({ error: "Valid email and OTP are required." });
  }

  const stored = otpStore.get(email);
  if (!stored) {
    return res.status(400).json({ error: "OTP not found for this email." });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired." });
  }

  if (stored.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(email);
    return res.status(429).json({ error: "Too many invalid attempts. Request a new OTP." });
  }

  if (String(otp) !== String(stored.otp)) {
    stored.attempts += 1;
    otpStore.set(email, stored);
    return res.status(400).json({ error: "Invalid OTP." });
  }

  otpStore.delete(email);
  return res.status(200).json({ message: "OTP verified successfully" });
});

app.post("/feedback", async (req, res) => {
  try {
    cleanupExpiredOtps();
    const payload = req.body || {};
    const recaptchaToken = payload.recaptchaToken;
    const requiredFields = [
      "name",
      "mobileNo",
      "location",
      "PINCODE",
      "address",
      "email",
      "feedbackrelatedto",
      "feedback",
    ];

    const missing = requiredFields.filter((field) => !payload[field]);
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missing.join(", ")}` });
    }

    if (!isValidEmail(payload.email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const recaptchaValid = await verifyRecaptcha(
      recaptchaToken,
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    );
    if (!recaptchaValid) {
      return res.status(400).json({ error: "reCAPTCHA verification failed." });
    }

    delete payload.recaptchaToken;

    if (dbAvailable) {
      await feedbackModel.create(payload);
      return res.status(201).json({ message: "Feedback submitted" });
    }

    console.warn("Feedback received without DB connection:", payload.email);
    return res
      .status(202)
      .json({ message: "Feedback received (DB unavailable in current setup)." });
  } catch (error) {
    console.error("Error submitting feedback:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
