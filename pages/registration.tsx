import { useRouter } from "next/router";
import { Formik, Form, Field, useField } from "formik";
import React from "react";
import * as Yup from "yup";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let tournament = await prisma.tournament.findFirst({
    select: {
      name: true,
      start: true,
      end: true,
      registrationStart: true,
      registrationEnd: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament));
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
  const start = new Date(tournament.start);
  const end = new Date(tournament.end);
  let dates: Array<any> = [];
  dates.push(`${start.getDate()}.${end.getMonth() + 1}.`);
  let loopDay = start;
  while (loopDay < end) {
    loopDay.setDate(loopDay.getDate() + 1);
    dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
  }

  const router = useRouter();

  const uploadImage = async (id: string) => {
    try {
      await fetch("api/upload", {
        method: "POST",
        body: JSON.stringify({
          url: "public/images/doggo.jpg",
          publicId: id
        })
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <div className="registration-form">
        <h1 className="registration-form-title">Ilmoittautuminen</h1>
        <Formik
          enableReinitialize={true}
          initialValues={{
            calendar: [...new Array(dates.length).fill("")],
            firstName: "",
            lastName: "",
            alias: "",
            email: "",
            phone: "",
            address: "",
            learningInstitution: "",
            eyeColor: "",
            hair: "",
            height: "",
            glasses: "",
            other: ""
          }}
          validationSchema={Yup.object({
            firstName: Yup.string().required("Pakollinen"),
            lastName: Yup.string().required("Pakollinen"),
            alias: Yup.string().required("Pakollinen"),
            email: Yup.string()
              .email("Epäkelpo sähköpostiosoite")
              .required("Pakollinen"),
            phone: Yup.number()
              .required("Pakollinen")
              .positive("Puhelinnumero ei voi sisältää negatiivisia lukuja")
              .integer("Syötä vain numeroita")
          })}
          onSubmit={async (values) => {
            const cal = {};
            dates.forEach((x, i) => (cal[x] = values.calendar[i]));
            var data = { ...values, calendar: undefined };
            data["calendar"] = cal;
            fetch("/api/user/create", {
              method: "POST",
              body: JSON.stringify(data)
            })
              .then((response) => response.json())
              .then((d) => {
                uploadImage(d.id);
                router.push({
                  pathname: `/tournaments/users/${d.id}`,
                  query: { registration: "ok" }
                });
              });
          }}
        >
          <Form>
            <TextInput label="Etunimi" name="firstName" type="text" />

            <TextInput label="Sukunimi" name="lastName" type="text" />

            <TextInput label="Alias" name="alias" type="text" />

            <TextInput label="Email" name="email" type="email" />

            <TextInput label="Puhelinnumero" name="phone" type="text" />

            <TextInput label="Osoite" name="address" type="text" />

            <TextInput
              label="Oppilaitos"
              name="learningInstitution"
              type="text"
            />

            <TextInput label="Silmät" name="eyeColor" type="text" />

            <TextInput label="Hiukset" name="hair" type="text" />

            <TextInput label="Pituus" name="height" type="number" />

            <TextInput label="Muu" name="other" type="text" />

            <h3>Kalenteritiedot</h3>
            {dates.map((d: string, i) => (
              <div key={i}>
                <label>{d}</label>
                <Field name={`calendar[${i}]`} as="textarea" />
              </div>
            ))}
            <button type="submit">Ilmoittaudu</button>
          </Form>
        </Formik>
        <p>
          {/* TODO linkki sääntöihin ja tietosuojaseloste näkyviin (sitten kun se on joskus valmis)*/}
          Ilmoittautuessasi turnaukseeen hyväksyt tietosuojaselosteen sekä
          Helsingin yliopiston salamurhaajien turnaus- ja asesäännöt
        </p>
      </div>
    </div>
  );
}
