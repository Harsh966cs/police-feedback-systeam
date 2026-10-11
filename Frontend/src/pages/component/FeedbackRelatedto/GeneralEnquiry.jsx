import { TextField } from "@mui/material";

const GeneralEnquiry = ({ value, onChange, language = "english" }) => {
  return (
    <TextField
      label={language === "hindi" ? "विषय (सामान्य पूछताछ)" : "Subject (General Enquiry)"}
      placeholder={language === "hindi" ? "पूछताछ का विषय लिखें" : "Enter enquiry subject"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
    />
  );
};

export default GeneralEnquiry;