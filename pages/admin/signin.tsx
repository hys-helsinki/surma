import { GetServerSideProps } from "next";
import { getCsrfToken, signIn } from "next-auth/react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useState } from "react";
import * as Yup from "yup";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken: csrfToken ?? "" }
  };
};

// Form values type
type SignInFormValues = {
  username: string;
  password: string;
};

interface SignInProps {
  csrfToken: string;
}

const SignIn: React.FC<SignInProps> = ({ csrfToken }) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialValues: SignInFormValues = { username: "", password: "" };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Required"),
    password: Yup.string().required("Required")
  });

  const handleSubmit = async (
    values: SignInFormValues,
    { setSubmitting }: FormikHelpers<SignInFormValues>
  ) => {
    setSubmitError(null);
    console.log("HANDLE SUBMIT");
    const res = await signIn("admin-login", {
      redirect: false,
      username: values.username,
      password: values.password
    });

    if (res && res.error) {
      setSubmitError("Invalid username or password");
    } else if (res && res.ok) {
      window.location.href = "/";
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "2em" }}>
      <h1>Sign in</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <input name="csrfToken" type="hidden" value={csrfToken} />
            <div style={{ margin: "1em 0" }}>
              <label htmlFor="username">Username or Email</label>
              <Field id="username" name="username" type="text" />
              <ErrorMessage
                name="username"
                component="div"
                style={{ color: "red" }}
              />
            </div>
            <div style={{ margin: "1em 0" }}>
              <label htmlFor="password">Password</label>
              <Field id="password" name="password" type="password" />
              <ErrorMessage
                name="password"
                component="div"
                style={{ color: "red" }}
              />
            </div>
            {submitError && (
              <div style={{ color: "red", marginBottom: "1em" }}>
                {submitError}
              </div>
            )}
            <button type="submit" disabled={isSubmitting}>
              Sign in
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignIn;
