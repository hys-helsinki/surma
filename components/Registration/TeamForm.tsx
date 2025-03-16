import { Box, Container, Grid } from "@mui/material";
import { FieldArray, Form, Formik } from "formik";
import * as Yup from "yup";
import TextInput from "./TextInput";
import { LoadingButton } from "@mui/lab";
import { Tournament } from "@prisma/client";
import { useState } from "react";
import GdprModal from "../GdprModal";
import { useRouter } from "next/router";
import { TEAM_MAX_PLAYERS } from "../../lib/constants";

const TeamForm = ({ tournament }: { tournament: Tournament }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const submitForm = async (values) => {
    setIsLoading(true);

    const formdata = {
      tournamentId: tournament.id,
      teamName: values["teamName"],
      users: values.users.map((user) => ({
        ...user,
        tournamentId: tournament.id
      }))
    };

    try {
      const response = await fetch("/api/team/create", {
        method: "POST",
        body: JSON.stringify(formdata)
      });
      router.push("/");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const initialValues = {
    teamName: "",
    users: [
      {
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
      }
    ]
  };

  return (
    <Container maxWidth="md">
      <h1>Ilmoittautuminen</h1>
      <Box sx={{ my: 4 }}>
        <h3>
          Tervetuloa ilmoittautumaan HYSin salamurhaturnaukseen &quot;
          {tournament.name}&quot;!
        </h3>
        <p>
          Ilmoittautuminen on kaksivaiheinen. Ensimmäisessä vaiheessa syöttäkää
          joukkueenne tiedot eli nimi ja pelaajien yhteystiedot. Joukkueen koko
          on 2-4 pelaajaa. Mukaan voi myös ilmoittautua yksin, jolloin
          tuomaristo määrittää sinulle joukkueen.
        </p>
        <p>
          Näitä tietoja tarvitaan Surmaan kirjautumiseen ja jotta tuomaristo voi
          ottaa pelaajiin yhteyttä turnaukseen liittyvissä asioissa.
          Ilmoittautuessasi turnaukseen hyväksyt Helsingin yliopiston
          salamurhaajien&nbsp;
          <GdprModal text="tietosuojakäytännön" />.
        </p>
        <p>
          Jos tulee mieleen kysymyksiä, otathan yhteyttä tuomaristoon
          (tuomaristo@salamurhaajat.net)
        </p>
        <p>
          <strong>
            HUOM! Vain yhden joukkueen jäsenen tarvitsee täyttää tämä lomake.
            Lomakkeen lähettämisen jälkeen joukkueen jäsenet pystyvät
            kirjautumaan sovellukseen tässä annetuilla sähköpostiosoitteilla.
          </strong>
        </p>
      </Box>
      <Box sx={{ my: 5 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object({
            teamName: Yup.string().required("Pakollinen")
          })}
          onSubmit={(values) => submitForm(values)}
        >
          {({ values }) => (
            <Form
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            >
              <TextInput label="Joukkueen nimi" name="teamName" type="text" />
              <FieldArray name="users">
                {({ remove, push }) => (
                  <div>
                    {values.users.length > 0 &&
                      values.users.map((user, index) => (
                        <Box sx={{ my: 3 }} key={index}>
                          <h2>Pelaaja {index + 1}</h2>
                          <Grid container spacing={{ xs: 0, md: 2 }}>
                            <Grid item xs={12} md={6}>
                              <TextInput
                                label="Etunimi"
                                name={`users.${index}.firstName`}
                                type="text"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextInput
                                label="Sukunimi"
                                name={`users.${index}.lastName`}
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
                          {index !== 0 && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => remove(index)}
                            >
                              Poista pelaaja
                            </button>
                          )}
                        </Box>
                      ))}
                    {values.users.length < TEAM_MAX_PLAYERS && (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          push({
                            firstName: "",
                            lastName: "",
                            email: "",
                            phone: ""
                          })
                        }
                      >
                        Lisää pelaaja
                      </button>
                    )}
                  </div>
                )}
              </FieldArray>
              <LoadingButton loading={isLoading} type="submit">
                Luo käyttäjät
              </LoadingButton>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default TeamForm;
