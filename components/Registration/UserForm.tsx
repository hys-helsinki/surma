import { Box, Container } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import logo from "/public/images/surma_logo.svg";
import TextInput from "./TextInput";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Tournament } from "@prisma/client";
import GdprModal from "../GdprModal";

const UserForm = ({ tournament }: { tournament: Tournament }) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async (values: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    setIsLoading(true);
    const formdata = { tournamentId: tournament.id, ...values };
    console.log(formdata.email);
    const response = await fetch("/api/user/create", {
      method: "POST",
      body: JSON.stringify(formdata)
    });
    const createdUser = await response.json();
    signIn("email", { callbackUrl: `/personal`, email: createdUser.email });
  };

  return (
    (<Container maxWidth="md">
      <Box sx={{ display: "flex" }}>
        <Image
          src={logo}
          width={60}
          height={60}
          alt="logo"
          style={{
            maxWidth: "100%",
            height: "auto"
          }} />
        <h1 style={{ marginLeft: "10px" }}>Ilmoittautuminen</h1>
      </Box>
      <Box sx={{ my: 4 }}>
        <p>
          Tervetuloa ilmoittautumaan HYSin salamurhaturnaukseen &quot;
          {tournament.name}&quot;!
        </p>
        <p>
          Ilmoittautuminen on kaksivaiheinen. Ensimmäiseksi pyydämme sinulta
          nimen, sähköpostiosoitteen ja puhelinnumeron. Näitä tietoja tarvitaan
          Surmaan kirjautumiseen ja jotta tuomaristo voi ottaa sinuun yhteyttä
          turnaukseen liittyvissä asioissa. Sähköpostiosoitteen vahvistamisen
          jälkeen pääset syöttämään loput turnauksessa vaadittavat tiedot.
          Ilmoittautuessasi turnaukseen hyväksyt Helsingin yliopiston
          salamurhaajien&nbsp;
          <GdprModal text="tietosuojakäytännön" />.
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
            firstName: Yup.string().required("Pakollinen"),
            lastName: Yup.string().required("Pakollinen"),
            email: Yup.string().required("Pakollinen"),
            phone: Yup.number()
              .required("Pakollinen")
              .integer("Syötä vain numeroita")
          })}
          onSubmit={(values) => {
            submitForm(values);
          }}
        >
          <Form>
            <TextInput label="Etunimi" name="firstName" type="text" />
            <TextInput label="Sukunimi" name="lastName" type="text" />
            <TextInput label="Sähköpostiosoite" name="email" type="email" />
            <TextInput label="Puhelinnumero" name="phone" type="text" />
            <LoadingButton
              loading={isLoading}
              type="submit"
              sx={{ width: "50%" }}
            >
              Luo käyttäjä
            </LoadingButton>
          </Form>
        </Formik>
      </Box>
    </Container>)
  );
};

export default UserForm;
