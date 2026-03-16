import { Alert, Box, Container, Grid, Snackbar, Button } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import TextInput from "./TextInput";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Tournament } from "@prisma/client";
import GdprModal from "../GdprModal";
import { useTranslation } from "next-i18next";

const UserForm = ({ tournament }: { tournament: Tournament }) => {
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const submitForm = async (values: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    setIsLoading(true);
    const formdata = { tournamentId: tournament.id, ...values };
    try {
      const response = await fetch("/api/user/create", {
        method: "POST",
        body: JSON.stringify(formdata)
      });
      const responseObject = await response.json();
      if (response.status === 201) {
        signIn("email", {
          callbackUrl: `/personal`,
          email: responseObject.email
        });
      } else if (response.status === 409) {
        setErrorMessage(t("registration.userForm.emailNotValidError"));
        setShowError(true);
      } else {
        setErrorMessage(t("registration.userForm.genericError"));
        setShowError(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <h1 style={{ marginLeft: "10px" }}>{t("registration.userForm.title")}</h1>

      <Box sx={{ my: 4 }}>
        <p>
          {t("registration.userForm.welcomeMessage")} &quot;
          {tournament.name}&quot;!
        </p>
        <p>
          {t("registration.userForm.description")}
          <GdprModal text={t("registration.userForm.privacyPolicyLink")} />.
        </p>
      </Box>
      <Box sx={{ my: 5 }}>
        <Formik
          enableReinitialize={true}
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phone: ""
          }}
          validationSchema={Yup.object({
            firstName: Yup.string().required(t("registration.userForm.requiredError")),
            lastName: Yup.string().required(t("registration.userForm.requiredError")),
            email: Yup.string().required(t("registration.userForm.requiredError")),
            phone: Yup.number()
              .typeError(t("registration.userForm.phoneTypeError"))
              .required(t("registration.userForm.requiredError"))
          })}
          onSubmit={(values) => {
            submitForm(values);
          }}
        >
          <Form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <Grid container spacing={{ xs: 0, md: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextInput label={t("registration.userForm.firstNameLabel")} name="firstName" type="text" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextInput label={t("registration.userForm.lastNameLabel")} name="lastName" type="text" />
              </Grid>
            </Grid>
            <TextInput label={t("registration.userForm.emailLabel")} name="email" type="email" />
            <TextInput label={t("registration.userForm.phoneLabel")} name="phone" type="text" />
            <Button loading={isLoading} type="submit">
              {t("registration.userForm.submitButton")}
            </Button>
          </Form>
        </Formik>
        <Snackbar open={showError} onClose={() => setShowError(false)}>
          <Alert
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
            onClose={() => setShowError(false)}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default UserForm;
