import Container from "@mui/material/Container";
import { Box, Grid, Button, Alert, Snackbar } from "@mui/material";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import "moment/locale/fi";
import "react-datetime/css/react-datetime.css";
import { Tournament } from "@prisma/client";
import FormikSwitch from "./FormikSwitch";
import DateTimePicker from "../../Common/DateTimePicker";
import TextInput from "../../Common/TextInput";
import ConfirmationMessage from "./ConfirmationMessage";

const CreateTournamentForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tournamentCreationOk, setTournamentCreationOk] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [umpires, setUmpires] = useState([]);

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
        headers: { "Content-Type": "application/json" },
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
      setErrorMessage(
        "Turnauksen luominen epäonnistui. Kokeile myöhemmin uudestaan"
      );
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const initialValues = {
    tournamentName: "",
    startTime: new Date(new Date().setHours(0, 0, 0, 0)),
    endTime: new Date(new Date().setHours(23, 59, 0, 0)),
    teamGame: false,
    registrationStartTime: new Date(new Date().setHours(0, 0, 0, 0)),
    registrationEndTime: new Date(new Date().setHours(23, 59, 0, 0)),
    users: [
      {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        responsibility: "",
        mainUmpire: false
      }
    ]
  };

  return (
    <Container maxWidth="md">
      {tournamentCreationOk ? (
        <ConfirmationMessage tournament={tournament} umpires={umpires} />
      ) : (
        <>
          <h1>Turnauksen luominen</h1>
          <Formik
            initialValues={initialValues}
            validateOnChange={true}
            validateOnBlur={true}
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
                    email: Yup.string().email().required("Pakollinen"),
                    phone: Yup.string().required("Pakollinen"),
                    responsibility: Yup.string(),
                    mainUmpire: Yup.boolean()
                  })
                )
                .test(
                  "has-main-umpire",
                  "Valitse vähintään yksi päätuomari",
                  (users) => Boolean(users?.some((user) => user?.mainUmpire))
                )
            })}
            onSubmit={handleSubmit}
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
                {submitCount > 0 && typeof errors.users === "string" && (
                  <div
                    className="registration-error"
                    style={{ paddingLeft: "0" }}
                  >
                    Valitse vähintään yksi päätuomari
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
                              name={`users[${index}].mainUmpire`}
                              label="Päätuomari?"
                            />
                          </Box>
                        ))}

                      <button
                        type="button"
                        onClick={() =>
                          push({
                            firstName: "",
                            lastName: "",
                            email: "",
                            phone: "",
                            responsibility: "",
                            mainUmpire: false
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
    </Container>
  );
};

export default CreateTournamentForm;
