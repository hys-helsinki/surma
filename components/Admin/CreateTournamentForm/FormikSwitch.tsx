import { FormControlLabel, styled } from "@mui/material";
import Switch, { SwitchProps } from "@mui/material/Switch";
import { useField } from "formik";

const StyledSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  "& .MuiSwitch-switchBase": {
    "&.Mui-checked": {
      "& + .MuiSwitch-track": {
        backgroundColor: "#eb3131",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#ca2e2e"
        })
      }
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#cf4533",
      border: "6px solid #fff"
    }
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#E9E9EA",
    opacity: 1
  }
}));

const FormikSwitch = ({ label, ...props }) => {
  const [field, , helpers] = useField(props.name);

  return (
    <FormControlLabel
      control={
        <StyledSwitch
          {...props}
          checked={Boolean(field.value)}
          onChange={(_, checked) => helpers.setValue(checked)}
          onBlur={field.onBlur}
        />
      }
      label={label}
    />
  );
};

export default FormikSwitch;
