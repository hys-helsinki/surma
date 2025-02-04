import { Box, Container } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import logo from "/public/images/surma_logo.svg";
import TextInput from "./TextInput";
import { LoadingButton } from "@mui/lab";
import { Tournament } from "@prisma/client";

const TeamForm = ({ tournament }: { tournament: Tournament }) => {
  const submitForm = (values) => {
    const groupedValues = Array.from([1, 2, 3, 4]).map((n) =>
      Object.entries(values)
        .filter((v) => v[0].includes(n.toString()))
        .map((v) => v[1])
    );

    const userObjects = groupedValues.map(
      ([firstName, lastName, email, phone]) => ({
        firstName,
        lastName,
        email,
        phone
      })
    );

    const formdata = {
      tournamentId: tournament.id,
      teamName: values["teamName"],
      ...userObjects
    };

    console.log(formdata);
  };

  const initialValues = {
    teamName: "",
    firstName1: "",
    lastName1: "",
    email1: "",
    phone1: "",
    firstName2: "",
    lastName2: "",
    email2: "",
    phone2: "",
    firstName3: "",
    lastName3: "",
    email3: "",
    phone3: "",
    firstName4: "",
    lastName4: "",
    email4: "",
    phone4: ""
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex" }}>
        <Image
          src={logo}
          width={60}
          height={60}
          alt="logo"
          style={{
            maxWidth: "100%",
            height: "auto"
          }}
        />
        <h1 style={{ marginLeft: "10px" }}>Ilmoittautuminen</h1>
      </Box>
      <Box sx={{ my: 5 }}>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={Yup.object({
            teamName: Yup.string().required("Pakollinen"),
            firstName1: Yup.string().required("Pakollinen"),
            lastName1: Yup.string().required("Pakollinen"),
            email1: Yup.string().required("Pakollinen"),
            phone1: Yup.number()
              .typeError("Syötä vain numeroita")
              .required("Pakollinen")
          })}
          onSubmit={(values) => submitForm(values)}
        >
          <Form>
            <TextInput label="Joukkueen nimi" name="teamName" type="text" />
            {Array.from([1, 2, 3, 4]).map((n) => (
              <Box sx={{ my: 5 }} key={n}>
                <h2>Pelaaja {n}</h2>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ width: "45%" }}>
                    <TextInput
                      label="Etunimi"
                      name={`firstName${n}`}
                      type="text"
                    />
                  </Box>
                  <Box sx={{ width: "45%" }}>
                    <TextInput
                      label="Sukunimi"
                      name={`lastName${n}`}
                      type="text"
                    />
                  </Box>
                </Box>
                <TextInput
                  label="Sähköpostiosoite"
                  name={`email${n}`}
                  type="email"
                />
                <TextInput
                  label="Puhelinnumero"
                  name={`phone${n}`}
                  type="text"
                />
              </Box>
            ))}
            <LoadingButton type="submit">Luo käyttäjät</LoadingButton>
          </Form>
        </Formik>
      </Box>
    </Container>
  );
};

export default TeamForm;
