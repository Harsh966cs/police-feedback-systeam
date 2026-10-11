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

const cities = [
  "Ajmer",
  "Alwar",
  "Anupgarh",
  "Balotra",
  "Banswara",
  "Baran",
  "Barmer",
  "Beawar",
  "Bharatpur",
  "Bhilwara",
  "Bikaner",
  "Bundi",
  "Chittorgarh",
  "Churu",
  "Dausa",
  "Deeg",
  "Dholpur",
  "Didwana-Kuchaman",
  "Dungarpur",
  "Gangapur City",
  "Hanumangarh",
  "Jaipur",
  "Jaipur Rural",
  "Jaisalmer",
  "Jalore",
  "Jhalawar",
  "Jhunjhunu",
  "Jodhpur",
  "Jodhpur Rural",
  "Karauli",
  "Kekri",
  "Khairthal-Tijara",
  "Kota",
  "Kotputli-Behror",
  "Nagaur",
  "Neem Ka Thana",
  "Pali",
  "Phalodi",
  "Pratapgarh",
  "Rajsamand",
  "Salumbar",
  "Sawai Madhopur",
  "Shahpura",
  "Sikar",
  "Sirohi",
  "Sri Ganganagar",
  "Tonk",
  "Udaipur",
  "Sanchore",
  "Barmer City",
];

const feedbackTypes = [
  "General Enquiry",
  "Complaint",
  "Suggestion",
  "Illegal Activity",
  "Body Offence",
  "Crime Against Women",
  "Cyber Crime",
];

const feedbackTypeLabels = {
  "General Enquiry": "सामान्य पूछताछ",
  Complaint: "शिकायत",
  Suggestion: "सुझाव",
  "Illegal Activity": "अवैध गतिविधि",
  "Body Offence": "शारीरिक अपराध",
  "Crime Against Women": "महिलाओं के विरुद्ध अपराध",
  "Cyber Crime": "साइबर अपराध",
};

const createInitialForm = (prefill = {}) => ({
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

const Main = ({ prefill = {}, skipOtpVerification = false }) => {
  const [language, setLanguage] = useState("english");
  const [captchaToken, setCaptchaToken] = useState("");
  const [otpVerified, setOtpVerified] = useState(Boolean(skipOtpVerification));
  const [status, setStatus] = useState({ type: "", message: "" });
  const [generalSubject, setGeneralSubject] = useState("");
  const [formData, setFormData] = useState(createInitialForm(prefill));

  const labels = useMemo(
    () => ({
      heading: language === "hindi" ? "राजस्थान पुलिस फीडबैक प्रणाली" : "Rajasthan Police Feedback System",
      subheading: language === "hindi" ? "नागरिक प्रतिक्रिया" : "Citizen Feedback",
      tagline:
        language === "hindi"
          ? "आपकी ईमानदार प्रतिक्रिया हमें सार्वजनिक सेवा बेहतर बनाने में मदद करती है।"
          : "Your honest feedback helps us improve public service.",
      name: language === "hindi" ? "पूरा नाम" : "Full Name",
      station: language === "hindi" ? "पुलिस थाना" : "Police Station",
      mobile: language === "hindi" ? "मोबाइल नंबर" : "Mobile No",
      address: language === "hindi" ? "पता" : "Address",
      city: language === "hindi" ? "शहर/गांव" : "City/Village",
      pin: language === "hindi" ? "पिन कोड" : "Pin Code",
      emailOtp: language === "hindi" ? "ईमेल OTP सत्यापन" : "Email OTP Verification",
      type: language === "hindi" ? "प्रतिक्रिया का प्रकार" : "Feedback Type",
      desc: language === "hindi" ? "प्रतिक्रिया का विवरण" : "Feedback Description",
      submit: language === "hindi" ? "जमा करें" : "Submit",
      reset: language === "hindi" ? "रीसेट करें" : "Reset",
      english: "English",
      hindi: "हिंदी",
    }),
    [language]
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!skipOtpVerification && field === "email") {
      setOtpVerified(false);
    }
  };

  const resetForm = (clearStatus = true) => {
    setFormData(createInitialForm(prefill));
    setOtpVerified(Boolean(skipOtpVerification));
    setCaptchaToken("");
    setGeneralSubject("");
    if (clearStatus) {
      setStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!/^\d{10}$/.test(formData.mobileNo)) {
      setStatus({ type: "error", message: "Mobile number must contain exactly 10 digits." });
      return;
    }

    if (!/^\d{6}$/.test(formData.PINCODE)) {
      setStatus({ type: "error", message: "PIN code must contain exactly 6 digits." });
      return;
    }

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

      resetForm(false);
      setStatus({
        type: "success",
        message: response.data?.message || "Feedback submitted successfully.",
      });
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
          <Button
            sx={{ backgroundColor: "#F0E68C", color: "black" }}
            variant="contained"
            onClick={() => setLanguage((prev) => (prev === "hindi" ? "english" : "hindi"))}
          >
            {language === "hindi" ? labels.english : labels.hindi}
          </Button>
        </Stack>
      </header>

      <Box sx={{ py: 2, textAlign: "center", backgroundColor: "hsl(56, 40%, 84%)" }}>
        <Typography variant="h5">        {labels.subheading}</Typography>
        <Typography sx={{ color: "#000080" }}>{labels.tagline}</Typography>
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

              <TextField
                required
                label={labels.station}
                value={formData.PoliceStation}
                onChange={(e) => handleChange("PoliceStation", e.target.value)}
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  label={labels.mobile}
                  value={formData.mobileNo}
                  inputMode="numeric"
                  inputProps={{ maxLength: 10, pattern: "[0-9]*" }}
                  onChange={(e) => handleChange("mobileNo", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={Boolean(skipOtpVerification && prefill.mobileNo)}
                />
                <TextField
                  fullWidth
                  required
                  label={labels.pin}
                  value={formData.PINCODE}
                  inputMode="numeric"
                  inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
                  onChange={(e) => handleChange("PINCODE", e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </Stack>

              <TextField
                required
                label={labels.address}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <FormControl fullWidth required>
                <InputLabel>{labels.city}</InputLabel>
                <Select
                  label={labels.city}
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                >
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                    language={language}
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
                      {language === "hindi" ? feedbackTypeLabels[feedbackType] : feedbackType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.feedbackrelatedto === "General Enquiry" ? (
                <GeneralEnquiry value={generalSubject} onChange={setGeneralSubject} language={language} />
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