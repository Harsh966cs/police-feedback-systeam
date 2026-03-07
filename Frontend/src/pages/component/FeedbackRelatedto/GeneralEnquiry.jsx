import { TextField } from "@mui/material";

const GeneralEnquiry = ({ value, onChange }) => {
  return (
    <TextField
      label="Subject (General Enquiry)"
      placeholder="Enter enquiry subject"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
    />
  );
};

export default GeneralEnquiry;