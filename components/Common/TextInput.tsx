import { useField } from "formik";

const TextInput = ({ label, ...props }) => {
  const [field, meta] = useField(props.name);

  const { textArea, ...inputProps } = props;
  return (
    <div style={{ marginBottom: "7px" }}>
      <label htmlFor={inputProps.id}>{label}</label>
      {meta.touched && meta.error ? (
        <div className="registration-error">{meta.error}</div>
      ) : null}
      {textArea ? (
        <textarea {...field} {...inputProps} />
      ) : (
        <input {...field} {...inputProps} />
      )}
    </div>
  );
};

export default TextInput;
