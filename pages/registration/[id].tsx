import { Form, Formik, useField } from "formik";
import { GetStaticPaths, GetStaticProps } from "next";
import prisma from "../../lib/prisma";
import * as Yup from "yup";
import logo from "/public/images/surma_logo.svg";
import Image from "next/image";
import { Box } from "@mui/material";
import { signIn } from "next-auth/react";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.id as string
    },
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      registrationStartTime: true,
      registrationEndTime: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament)); // to avoid Next.js serialization error

  return {
    props: { tournament }
  };
};

const TextInput = ({ label, ...props }) => {
  const [field, meta] = useField(props.name);
  return (
    <>
      <label htmlFor={props.name}>{label}</label>
      {meta.touched && meta.error ? (
        <div className="registration-error">{meta.error}</div>
      ) : null}
      <input {...field} {...props} />
    </>
  );
};

export default function Registration({ tournament }) {

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);
  let dates: Array<any> = [];
  dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
  let loopDay = start;
  while (loopDay < end) {
    loopDay.setDate(loopDay.getDate() + 1);
    dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
  }

  const submitForm = async (values) => {
    const formdata = {tournamentId: tournament.id, ...values}
    console.log(formdata.email)
    const response = await fetch("/api/user/create", {
      method: "POST",
      body: JSON.stringify(formdata)
    })
    const createdUser = await response.json()
    console.log(createdUser)
    signIn("email", { callbackUrl: `/personal`, email: createdUser.email})
  }

  return (
    <div>
      {new Date().getTime() <
      new Date(tournament.registrationEndTime).getTime() ? (
        <div className="registration-form">
          <div style={{ float: "left", width: "10%" }}>
            <Image src={logo} width={60} height={60} alt="logo" />
          </div>
          <h1 className="registration-form-title">Ilmoittautuminen</h1>
          <Box sx={{my: 5}}>
            <Formik
              enableReinitialize={true}
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
              }}
              validationSchema={Yup.object({
                firstName: Yup.string().required("Pakollinen"),
                lastName: Yup.string().required("Pakollinen"),
                email: Yup.string()
                  .email("Epäkelpo sähköpostiosoite")
                  .required("Pakollinen"),
                phone: Yup.number()
                .required("Pakollinen")
                .positive("Puhelinnumero ei voi sisältää negatiivisia lukuja")
                .integer("Syötä vain numeroita"),
              })}
              onSubmit={(values) => {
                  submitForm(values)
              }}
            >
              <Form>
                <TextInput label="Etunimi" name="firstName" type="text" />

                <TextInput label="Sukunimi" name="lastName" type="text" />

                <TextInput label="Sähköpostiosoite" name="email" type="email" />

                <TextInput label="Puhelinnumero" name="phone" type="text" />
                
                <button type="submit">Ilmoittaudu</button>
              </Form>
            </Formik>
          </Box>
        </div>
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tournamentIds = await prisma.tournament.findMany({
    select: { id: true }
  });
  return {
    paths: tournamentIds.map((tournament) => ({
      params: tournament
    })),
    fallback: false
  };
};