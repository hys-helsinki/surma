import { styled } from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import { red } from "@mui/material/colors";

const StyledButton = styled(Button)<ButtonProps>(() => ({
  color: "black",
  fontFamily: "inherit",
  fontWeight: "bolder",
  letterSpacing: "0",
  textTransform: "none",
  backgroundColor: "white",
  marginTop: "1rem",
  marginBottom: "1rem",
  padding: "10px",
  "&:hover": {
    backgroundColor: red[900],
    color: "white"
  }
}));

const SurmaButton = ({ children, ...props }: ButtonProps) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default SurmaButton;
