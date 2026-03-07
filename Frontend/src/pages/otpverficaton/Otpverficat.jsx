import { useEffect, useState } from "react";
import axios from "axios";
import Stack from "@mui/material/Stack";
import { Alert, Button, TextField } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const OtpVerification = ({ email, onEmailChange, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [debugOtp, setDebugOtp] = useState("");

  useEffect(() => {
    setOtp("");
    setOtpSent(false);
    setStatus({ type: "", message: "" });
    setDebugOtp("");
    if (onVerified) {
      onVerified(false);
    }
  }, [email, onVerified]);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendOTP = async () => {
    if (!isValidEmail(email || "")) {
      setStatus({ type: "error", message: "Enter a valid email before sending OTP." });
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
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setStatus({ type: "error", message: "Enter OTP to verify." });
      return;
    }
    try {
      await axios.post(`${API_BASE}/otp/verify`, { email, otp });
      setStatus({ type: "success", message: "OTP verified successfully." });
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
          label="Email"
          size="small"
          type="email"
          sx={{ backgroundColor: "white", minWidth: "260px" }}
          value={email}
          onChange={(e) => onEmailChange(e.target.value.trim())}
        />
        <Button variant="contained" onClick={handleSendOTP}>
          {otpSent ? "Resend OTP" : "Send OTP"}
        </Button>
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField
          id="otp"
          label="OTP"
          size="small"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          sx={{ backgroundColor: "white", maxWidth: "140px" }}
        />
        <Button variant="outlined" onClick={handleVerifyOTP} disabled={!otpSent}>
          Verify OTP
        </Button>
      </Stack>
      {status.message && <Alert severity={status.type || "info"}>{status.message}</Alert>}
      {debugOtp ? <Alert severity="warning">Development OTP: {debugOtp}</Alert> : null}
    </Stack>
  );
};

export default OtpVerification;
