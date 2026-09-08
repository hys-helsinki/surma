import Box from "@mui/material/Box";
import Datetime from "react-datetime";
import { useField } from "formik";

const DateTimePicker = ({ label, name }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (date) => {
    helpers.setValue(date);
  };

  return (
    <Box my={1}>
      {label && <label>{label}</label>}
      {meta.error ? (
        <div className="registration-error">{meta.error}</div>
      ) : null}
      <Datetime
        {...field}
        inputProps={{ name: name }}
        value={field.value}
        onChange={handleChange}
      />
    </Box>
  );
};

export default DateTimePicker;
