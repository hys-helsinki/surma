import LoadingButton from "@mui/lab/LoadingButton";
import { Tournament } from "@prisma/client";
import { useState } from "react";
import Datetime from "react-datetime";
import "moment/locale/fi";
import "react-datetime/css/react-datetime.css";
import Box from "@mui/material/Box";
import { Form, Formik } from "formik";
import { useField } from "formik";
import moment from "moment";
import * as Yup from "yup";

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

const TournamentEditForm = ({ tournament }: { tournament: Tournament }) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async (values) => {
    setIsLoading(true);
    const data: FormData = values;
    try {
      await fetch(`/api/tournament/${tournament.id}/update`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };
  return (
    <Box width={{ xs: "100%", md: "25%" }}>
      <Formik
        enableReinitialize={true}
        initialValues={{
          startTime: moment(tournament.startTime),
          endTime: moment(tournament.endTime),
          registrationStartTime: moment(tournament.registrationStartTime),
          registrationEndTime: moment(tournament.registrationEndTime)
        }}
        onSubmit={(values) => {
          submitForm(values);
        }}
        validationSchema={Yup.object({
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
            .required("Pakollinen")
        })}
      >
        <Form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          <DateTimePicker label="Turnaus alkaa" name="startTime" />
          <DateTimePicker label="Turnaus päättyy" name="endTime" />
          <DateTimePicker
            label="Ilmoittautuminen alkaa"
            name="registrationStartTime"
          />
          <DateTimePicker
            label="Ilmoittautuminen päättyy"
            name="registrationEndTime"
          />
          <LoadingButton loading={isLoading} type="submit">
            Tallenna muutokset
          </LoadingButton>
        </Form>
      </Formik>
    </Box>
  );
};

const DeleteButton = () => {
  const [loading, setLoading] = useState(false);
  const deleteTournamentResources = async () => {
    if (
      window.confirm(
        "Oletko varma, että haluat poistaa kaiken turnaukseen liittyvän datan? Tietoja ei voi palauttaa myöhemmin"
      )
    ) {
      setLoading(true);

      // const res = await fetch(`/api/tournament/${tournament.id}/delete`, {
      //   method: "DELETE"
      // });
      // console.log(res);
      console.log("ok");
      setLoading(false);
    } else {
      console.log("cancel");
    }
  };

  return (
    <Box
      sx={{
        borderTop: "2px dashed white ",
        width: { xs: "100%", md: "40%" },
        paddingTop: 2
      }}
    >
      <div>
        <i>
          Huom! Alla olevan napin painaminen lopettaa turnauksen ja poistaa
          kaiken siihen liittyvän datan (turnauksen tiedot sekä kaikkien
          käyttäjien - sekä pelaajien että tuomarien - tiedot). Surmaan ei voi
          enää tämän jälkeen kirjautua eikä tietoja voi palauttaa myöhemmin,
          joten otathan talteen kaiken tarvittavan datan ennen tietojen
          poistamista.
        </i>
      </div>

      <LoadingButton
        onClick={() => deleteTournamentResources()}
        loading={loading}
        className="delete-tournament"
      >
        Lopeta turnaus ja poista data
      </LoadingButton>
    </Box>
  );
};

const Settings = ({ tournament }: { tournament: Tournament }) => {
  return (
    <Box>
      <TournamentEditForm tournament={tournament} />
      <DeleteButton />
    </Box>
  );
};

export default Settings;
