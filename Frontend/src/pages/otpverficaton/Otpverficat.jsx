import { useEffect, useState } from "react";
import axios from "axios";
import Stack from "@mui/material/Stack";
import { Alert, Button, TextField } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const OtpVerification = ({ email, onEmailChange, onVerified, language = "english" }) => {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [debugOtp, setDebugOtp] = useState("");

  useEffect(() => {
    setOtp("");
    setOtpSent(false);
    setResendCooldown(0);
    setStatus({ type: "", message: "" });
    setDebugOtp("");
    if (onVerified) {
      onVerified(false);
    }
  }, [email, onVerified]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((remaining) => Math.max(remaining - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const isValidEmail = (value) => /^[^\s@]+@gmail\.com$/i.test(value);

  const handleSendOTP = async () => {
    if (!isValidEmail(email || "")) {
      setStatus({ type: "error", message: "Enter a valid Gmail address before sending OTP." });
      return;
    }
    try {
      const response = await axios.post(`${API_BASE}/otp/send`, { email });
      setOtpSent(true);
      setDebugOtp(response?.data?.debugOtp ? String(response.data.debugOtp) : "");
      setStatus({ type: "success", message: "OTP sent successfully." });
      if (onVerified) {
        onVerified(false);
      }
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to send OTP.";
      setStatus({ type: "error", message });
      setDebugOtp("");

      if (error?.response?.status === 429) {
        const responseSeconds = Number(error?.response?.data?.retryAfterSeconds);
        const messageSeconds = Number(message.match(/\d+/)?.[0]);
        const waitSeconds = Number.isFinite(responseSeconds)
          ? responseSeconds
          : Number.isFinite(messageSeconds)
            ? messageSeconds
            : 60;
        setResendCooldown(waitSeconds);
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setStatus({ type: "error", message: "Enter the 6-digit OTP to verify." });
      return;
    }
    try {
      await axios.post(`${API_BASE}/otp/verify`, { email, otp });
      setStatus({ type: "success", message: "OTP verified successfully. You can continue." });
      if (onVerified) {
        onVerified(true);
      }
      setDebugOtp("");
    } catch (error) {
      if (onVerified) {
        onVerified(false);
      }
      const message = error?.response?.data?.error || "OTP verification failed.";
      setStatus({ type: "error", message });
    }
  };

  return (
    <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
      <Stack direction="row" spacing={1}>
        <TextField
          required
          id="email"
          label={language === "hindi" ? "ईमेल" : "Email"}
          size="small"
          type="email"
          sx={{ backgroundColor: "white", minWidth: "260px" }}
          value={email}
          onChange={(e) => onEmailChange(e.target.value.trim())}
        />
        <Button variant="contained" onClick={handleSendOTP} disabled={resendCooldown > 0}>
          {resendCooldown > 0
            ? language === "hindi"
              ? `${resendCooldown} सेकंड में फिर भेजें`
              : `Resend in ${resendCooldown}s`
            : otpSent
            ? language === "hindi"
              ? "OTP फिर भेजें"
              : "Resend OTP"
            : language === "hindi"
              ? "OTP भेजें"
              : "Send OTP"}
        </Button>
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField
          id="otp"
          label={language === "hindi" ? "OTP" : "OTP"}
          size="small"
          inputMode="numeric"
          inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          sx={{ backgroundColor: "white", maxWidth: "140px" }}
        />
        <Button variant="outlined" onClick={handleVerifyOTP} disabled={!otpSent}>
          {language === "hindi" ? "OTP सत्यापित करें" : "Verify OTP"}
        </Button>
      </Stack>
      {status.message && (
        <Alert severity={status.type || "info"} role="alert">
          {status.message}
        </Alert>
      )}
      {debugOtp ? <Alert severity="warning">Development OTP: {debugOtp}</Alert> : null}
    </Stack>
  );
};

export default OtpVerification;
