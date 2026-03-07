import { useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import OtpVerification from "../otpverficaton/Otpverficat";
import GeneralEnquiry from "../component/FeedbackRelatedto/GeneralEnquiry";
import Ashoka from "../../Images/download.png";
import "./main.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const districts = ["Ajmer", "Alwar", "Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner"];
const feedbackTypes = [
  "General Enquiry",
  "Complaint",
  "Suggestion",
  "Illegal Activity",
  "Body Offence",
  "Crime Against Women",
  "Cyber Crime",
];

const createInitialForm = (prefill = {}) => ({
  District: "",
  PoliceStation: "",
  name: prefill.name || "",
  mobileNo: prefill.mobileNo || "",
  location: "",
  PINCODE: "",
  address: "",
  email: prefill.email || "",
  feedbackrelatedto: "",
  feedback: "",
});

const Main = ({ prefill = {}, skipOtpVerification = false, onBack }) => {
  const [language, setLanguage] = useState("english");
  const [captchaToken, setCaptchaToken] = useState("");
  const [otpVerified, setOtpVerified] = useState(Boolean(skipOtpVerification));
  const [status, setStatus] = useState({ type: "", message: "" });
  const [generalSubject, setGeneralSubject] = useState("");
  const [formData, setFormData] = useState(createInitialForm(prefill));

  const labels = useMemo(
    () => ({
      heading: language === "hindi" ? "Rajasthan Police Feedback System (Hindi)" : "Rajasthan Police Feedback System",
      subheading: language === "hindi" ? "Citizen Feedback" : "Citizen Feedback",
      name: language === "hindi" ? "Full Name" : "Full Name",
      district: language === "hindi" ? "District" : "District",
      station: language === "hindi" ? "Police Station" : "Police Station",
      mobile: language === "hindi" ? "Mobile No" : "Mobile No",
      address: language === "hindi" ? "Address" : "Address",
      city: language === "hindi" ? "City/Village" : "City/Village",
      pin: language === "hindi" ? "Pin Code" : "Pin Code",
      emailOtp: language === "hindi" ? "Email OTP Verification" : "Email OTP Verification",
      type: language === "hindi" ? "Feedback Type" : "Feedback Type",
      desc: language === "hindi" ? "Feedback Description" : "Feedback Description",
      submit: language === "hindi" ? "Submit" : "Submit",
      reset: language === "hindi" ? "Reset" : "Reset",
    }),
    [language]
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!skipOtpVerification && field === "email") {
      setOtpVerified(false);
    }
  };

  const resetForm = () => {
    setFormData(createInitialForm(prefill));
    setOtpVerified(Boolean(skipOtpVerification));
    setCaptchaToken("");
    setGeneralSubject("");
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!captchaToken) {
      setStatus({ type: "error", message: "Complete reCAPTCHA before submitting." });
      return;
    }

    if (!otpVerified) {
      setStatus({ type: "error", message: "Verify OTP before submitting feedback." });
      return;
    }

    try {
      const feedbackMessage =
        formData.feedbackrelatedto === "General Enquiry" && generalSubject.trim()
          ? `[Subject] ${generalSubject.trim()}\n${formData.feedback}`
          : formData.feedback;

      const response = await axios.post(`${API_BASE}/feedback`, {
        ...formData,
        feedback: feedbackMessage,
        recaptchaToken: captchaToken,
      });

      setStatus({
        type: "success",
        message: response.data?.message || "Feedback submitted successfully.",
      });
      resetForm();
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to submit feedback.";
      setStatus({ type: "error", message });
    }
  };

  return (
    <Box>
      <header className="hedar">
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1 }}>
          <img style={{ width: 40 }} src={Ashoka} alt="Ashoka emblem" />
          <Typography variant="h5" sx={{ color: "#000080", fontWeight: 700 }}>
            {labels.heading}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 1 }}>
          {onBack ? (
            <Button sx={{ backgroundColor: "#F0E68C", color: "black" }} variant="contained" onClick={onBack}>
              Back
            </Button>
          ) : null}
          <Button
            sx={{ backgroundColor: "#F0E68C", color: "black" }}
            variant="contained"
            onClick={() => setLanguage((prev) => (prev === "hindi" ? "english" : "hindi"))}
          >
            {language === "hindi" ? "English" : "Hindi"}
          </Button>
        </Stack>
      </header>

      <Box sx={{ py: 2, textAlign: "center", backgroundColor: "hsl(56, 40%, 84%)" }}>
        <Typography variant="h5">{labels.subheading}</Typography>
        <Typography sx={{ color: "#000080" }}>
          Your honest feedback helps us improve public service.
        </Typography>
      </Box>

      <Box className="container" sx={{ py: 3 }}>
        <Card sx={{ width: "min(900px, 94vw)", backgroundColor: "lightyellow", boxShadow: 4 }}>
          <CardContent>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                required
                label={labels.name}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>{labels.district}</InputLabel>
                  <Select
                    label={labels.district}
                    value={formData.District}
                    onChange={(e) => handleChange("District", e.target.value)}
                  >
                    {districts.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  required
                  label={labels.station}
                  value={formData.PoliceStation}
                  onChange={(e) => handleChange("PoliceStation", e.target.value)}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  label={labels.mobile}
                  value={formData.mobileNo}
                  onChange={(e) => handleChange("mobileNo", e.target.value.replace(/[^0-9]/g, ""))}
                  disabled={Boolean(skipOtpVerification && prefill.mobileNo)}
                />
                <TextField
                  fullWidth
                  required
                  label={labels.pin}
                  value={formData.PINCODE}
                  onChange={(e) => handleChange("PINCODE", e.target.value.replace(/[^0-9]/g, ""))}
                />
              </Stack>

              <TextField
                required
                label={labels.address}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <TextField
                required
                label={labels.city}
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />

              {skipOtpVerification ? (
                <TextField required label="Email" value={formData.email} disabled />
              ) : (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {labels.emailOtp}
                  </Typography>
                  <OtpVerification
                    email={formData.email}
                    onEmailChange={(email) => handleChange("email", email)}
                    onVerified={setOtpVerified}
                  />
                </>
              )}

              <FormControl fullWidth required>
                <InputLabel>{labels.type}</InputLabel>
                <Select
                  label={labels.type}
                  value={formData.feedbackrelatedto}
                  onChange={(e) => handleChange("feedbackrelatedto", e.target.value)}
                >
                  {feedbackTypes.map((feedbackType) => (
                    <MenuItem key={feedbackType} value={feedbackType}>
                      {feedbackType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.feedbackrelatedto === "General Enquiry" ? (
                <GeneralEnquiry value={generalSubject} onChange={setGeneralSubject} />
              ) : null}

              <TextField
                required
                label={labels.desc}
                multiline
                minRows={4}
                value={formData.feedback}
                onChange={(e) => handleChange("feedback", e.target.value)}
              />

              <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setCaptchaToken(token || "")} />

              {status.message ? <Alert severity={status.type || "info"}>{status.message}</Alert> : null}

              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained">
                  {labels.submit}
                </Button>
                <Button type="button" variant="outlined" onClick={resetForm}>
                  {labels.reset}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Main;