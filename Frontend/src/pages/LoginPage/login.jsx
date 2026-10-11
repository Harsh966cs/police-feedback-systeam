import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import OtpVerification from "../otpverficaton/Otpverficat";

const Login = ({ onLoginSuccess, onGoSignup }) => {
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleContinue = () => {
    if (!name.trim() || !mobileNo.trim() || !email.trim()) {
      setStatus({ type: "error", message: "Please fill name, mobile number and email." });
      return;
    }

    if (!/^\d{10}$/.test(mobileNo)) {
      setStatus({ type: "error", message: "Mobile number must contain exactly 10 digits." });
      return;
    }

    if (!otpVerified) {
      setStatus({ type: "error", message: "Please verify OTP before continuing." });
      return;
    }

    setStatus({ type: "success", message: "Verified successfully." });
    onLoginSuccess?.({ name: name.trim(), mobileNo: mobileNo.trim(), email: email.trim() });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", backgroundColor: "#F4D1A4", p: 2 }}>
      <Card sx={{ width: "min(620px, 95vw)", backgroundColor: "#FFE8A3" }}>
        <CardContent>
          <Typography variant="h4" align="center" sx={{ mb: 2 }}>
            Login
          </Typography>
          <Stack spacing={2}>
            <TextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField
              label="Mobile Number"
              value={mobileNo}
              inputMode="numeric"
              inputProps={{ maxLength: 10, pattern: "[0-9]*" }}
              onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
            />
            <OtpVerification email={email} onEmailChange={setEmail} onVerified={setOtpVerified} />

            {status.message ? <Alert severity={status.type || "info"}>{status.message}</Alert> : null}

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleContinue}>
                Continue
              </Button>
              <Button variant="text" onClick={onGoSignup}>
                New user? Sign up
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
