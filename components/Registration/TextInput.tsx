import { useField } from "formik";

const TextInput = ({ label, ...props }) => {
    const [field, meta] = useField(props.name);
    return (
      <div style={{marginBottom: "7px"}}>
        <label htmlFor={props.id}>{label}</label>
        {meta.touched && meta.error ? (
          <div className="registration-error">{meta.error}</div>
        ) : null}
        <input {...field} {...props} />
      </div>
    );
  };

export default TextInput