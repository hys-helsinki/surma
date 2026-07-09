import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import TextInput from "../../components/Common/TextInput";
import {
  Box,
  Grid,
  Button,
  FormControlLabel,
  styled,
  Alert,
  Snackbar
} from "@mui/material";
import { Formik, Form, FieldArray, useField } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Datetime from "react-datetime";
import "moment/locale/fi";
import "react-datetime/css/react-datetime.css";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "../api/auth/[...nextauth]";

const isCurrentUserAuthorized = async (context) => {
  const session = await getServerSession(context.req, context.res, authConfig);

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "ADMIN"
    }
  });
  return !!user;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(context))) {
    console.log("Unauthorized tournament creation view!");
    return { redirect: { destination: "/", permanent: false } };
  }
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"]))
    }
  };
};

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

export default function CreateTournament() {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tournamentCreationOk, setTournamentCreationOk] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>();
  const [umpires, setUmpires] = useState([]);

  const modifyDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.toLocaleString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      day: "numeric",
      month: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })}`;
    return formattedDate;
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const tournament = {
      name: values.tournamentName,
      startTime: values.startTime,
      endTime: values.endTime,
      registrationEndTime: values.registrationEndTime,
      registrationStartTime: values.registrationStartTime,
      teamGame: values.teamGame
    };
    const umpires = values.users;

    try {
      const response = await fetch("/api/tournament/create", {
        method: "POST",
        body: JSON.stringify({ tournament, umpires })
      });
      const responseObject = await response.json();
      if (response.status === 201) {
        const { createdTournament, umpireUsers } = responseObject;
        setTournament(createdTournament);
        setUmpires(umpireUsers);
        setTournamentCreationOk(true);
      } else if (response.status === 409) {
        setErrorMessage(
          "Jokin annetuista sähköposteista on jo olemassa. Kokeile toista osoitetta"
        );
        setShowError(true);
      } else {
        setErrorMessage(
          "Turnauksen luominen epäonnistui. Kokeile myöhemmin uudestaan"
        );
        setShowError(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialValues = {
    tournamentName: "",
    startTime: new Date(),
    endTime: new Date(),
    teamGame: false,
    registrationStartTime: new Date(),
    registrationEndTime: new Date(),
    users: [
      {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        responsibility: "",
        isMainUmpire: false
      }
    ]
  };

  return (
    <AuthenticationRequired>
      <Container maxWidth="md">
        {tournamentCreationOk ? (
          <div>
            <h1>Turnauksen luominen onnistui!</h1>
            <p>
              Tuomarit voivat nyt kirjautua Surmaan lomakkeeseen syötetyillä
              sähköposteilla. Alla vielä vahvistuksena luodun turnauksen ja
              tuomareiden tiedot.
            </p>
            <p>Voit nyt kirjautua ulos sovelluksesta.</p>
            <h3>Turnaus</h3>
            <ul>
              <li>Nimi: {tournament.name}</li>
              <li>Alkaa: {modifyDate(tournament.startTime.toString())}</li>
              <li>Päättyy: {modifyDate(tournament.endTime.toString())}</li>
              <li>
                Ilmo alkaa:{" "}
                {modifyDate(tournament.registrationStartTime.toString())}
              </li>
              <li>
                Ilmo päättyy:{" "}
                {modifyDate(tournament.registrationEndTime.toString())}
              </li>
              <li>Joukkueturnaus: {tournament.teamGame ? "Kyllä" : "Ei"}</li>
            </ul>
            <h3>Tuomarit</h3>
            {umpires.map((umpire) => (
              <div key={umpire.user.email}>
                <p>
                  {umpire.user.firstName} {umpire.user.lastName}
                </p>
                <ul>
                  <li>Sähköposti: {umpire.user.email}</li>
                  <li>Puhelinnumero: {umpire.user.phone}</li>
                  <li>Vastuualue: {umpire.responsibility}</li>
                  <li>Päätuomari: {umpire.mainUmpire ? "Kyllä" : "Ei"}</li>
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <>
            <h1>Turnauksen luominen</h1>
            <Formik
              initialValues={initialValues}
              validationSchema={Yup.object({
                tournamentName: Yup.string().required("Pakollinen"),
                startTime: Yup.date()
                  .typeError("Tarkista päivämäärän formaatti")
                  .required("Pakollinen"),
                endTime: Yup.date()
                  .typeError("Tarkista päivämäärän formaatti")
                  .required("Pakollinen"),
                registrationStartTime: Yup.date()
                  .typeError("Tarkista päivämäärän formaatti")
                  .required("Pakollinen"),
                registrationEndTime: Yup.date()
                  .typeError("Tarkista päivämäärän formaatti")
                  .required("Pakollinen"),
                users: Yup.array()
                  .of(
                    Yup.object().shape({
                      firstName: Yup.string().required("Pakollinen"),
                      lastName: Yup.string().required("Pakollinen"),
                      email: Yup.string().required("Pakollinen"),
                      phone: Yup.string().required("Pakollinen"),
                      responsibility: Yup.string(),
                      isMainUmpire: Yup.boolean()
                    })
                  )
                  .test(
                    "has-main-umpire",
                    "Valitse vähintään yksi päätuomari",
                    (users) =>
                      Boolean(users?.some((user) => user?.isMainUmpire))
                  )
              })}
              onSubmit={(values) => handleSubmit(values)}
            >
              {({ values, errors, submitCount }) => (
                <Form
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                >
                  <h2>1. Perustiedot</h2>
                  <TextInput
                    label="Turnauksen nimi"
                    name="tournamentName"
                    type="text"
                  />
                  <DateTimePicker label="Turnaus alkaa" name="startTime" />
                  <DateTimePicker label="Turnaus päättyy" name="endTime" />
                  <FormikSwitch
                    color="default"
                    name="teamGame"
                    label="Joukkueturnaus?"
                  />
                  <h2>2. Ilmoittautuminen</h2>
                  <DateTimePicker
                    label="Ilmoittautuminen alkaa"
                    name="registrationStartTime"
                  />
                  <DateTimePicker
                    label="Ilmoittautuminen päättyy"
                    name="registrationEndTime"
                  />
                  <h2>3. Tuomaristo</h2>
                  {submitCount > 0 && errors.users && (
                    <div className="registration-error">
                      {typeof errors.users === "string"
                        ? errors.users
                        : "Valitse vähintään yksi päätuomari"}
                    </div>
                  )}
                  <FieldArray name="users">
                    {({ remove, push }) => (
                      <div>
                        {values.users.length > 0 &&
                          values.users.map((user, index) => (
                            <Box sx={{ my: 3 }} key={index}>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: "1rem",
                                  alignItems: "center",
                                  justifyContent: "left"
                                }}
                              >
                                <h3>Tuomari {index + 1}</h3>

                                {index !== 0 && (
                                  <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => remove(index)}
                                  >
                                    Poista tuomari
                                  </button>
                                )}
                              </Box>
                              <Grid
                                container
                                spacing={{ xs: 0, md: 2 }}
                                className="firstAndLastName"
                              >
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextInput
                                    label="Etunimi"
                                    name={`users[${index}].firstName`}
                                    type="text"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextInput
                                    label="Sukunimi"
                                    name={`users[${index}].lastName`}
                                    type="text"
                                  />
                                </Grid>
                              </Grid>
                              <TextInput
                                label="Sähköpostiosoite"
                                name={`users[${index}].email`}
                                type="email"
                              />
                              <TextInput
                                label="Puhelinnumero"
                                name={`users[${index}].phone`}
                                type="text"
                              />
                              <TextInput
                                label="Vastuualue"
                                name={`users[${index}].responsibility`}
                                type="text"
                              />
                              <FormikSwitch
                                color="default"
                                name={`users[${index}].isMainUmpire`}
                                label="Päätuomari?"
                              />
                            </Box>
                          ))}

                        <button
                          onClick={() =>
                            push({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              responsibility: "",
                              isMainUmpire: false
                            })
                          }
                        >
                          Lisää tuomari
                        </button>
                      </div>
                    )}
                  </FieldArray>
                  <Button loading={isLoading} type="submit">
                    Luo turnaus
                  </Button>
                </Form>
              )}
            </Formik>
          </>
        )}
      </Container>
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
    </AuthenticationRequired>
  );
}
