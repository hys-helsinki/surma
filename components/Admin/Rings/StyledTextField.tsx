import { styled, TextField } from "@mui/material";

const StyledTextField = styled(TextField)({
  "& label": {
    color: "white"
  },
  "& label.Mui-focused": {
    color: "white"
  },
  ".MuiOutlinedInput-input": {
    color: "white"
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "white"
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white"
    },
    "&:hover fieldset": {
      borderColor: "white"
    },
    "&.Mui-focused fieldset": {
      borderColor: "white"
    }
  }
});

export default StyledTextField;
