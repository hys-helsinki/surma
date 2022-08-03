import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import React from "react";
import * as Yup from "yup";

export default function Registration() {
  const router = useRouter();
  const dates = ["1.10.", "2.10.", "3.10.", "4.10."];
  return (
    <div>
      <h1>Ilmoittautuminen</h1>
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
        // näitä voi lisätä tarvittaessa helposti, tein näin alkuun vain näille tärkeimmille validaatioskeemat
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
              router.push({
                pathname: `/users/${d.id}`,
                query: { registration: "ok" }
              });
            });
        }}
      >
        <Form>
          <label>Etunimi</label>
          <Field name="firstName" />
          <ErrorMessage name="firstName" />

          <label>Sukunimi</label>
          <Field name="lastName" />
          <ErrorMessage name="lastName" />

          <label>Alias</label>
          <Field name="alias" />
          <ErrorMessage name="alias" />

          <label>Email</label>
          <Field name="email" />
          <ErrorMessage name="email" />

          <label>Puhelinnumero</label>
          <Field name="phone" />
          <ErrorMessage name="phone" />

          <label>Osoite</label>
          <Field name="address" />
          <ErrorMessage name="address" />

          <label>Oppilaitos</label>
          <Field name="learningInstitution" />
          <ErrorMessage name="learningInstitution" />

          <label>Silmät</label>
          <Field name="eyeColor" />
          <ErrorMessage name="eyeColor" />

          <label>Hiukset</label>
          <Field name="hair" />
          <ErrorMessage name="hair" />

          <label>Pituus</label>
          <Field name="height" type="number" />
          <ErrorMessage name="height" />

          <label>Silmälasit</label>
          <Field name="glasses" />
          <ErrorMessage name="glasses" />

          <label>Muu</label>
          <Field name="other" />
          <ErrorMessage name="other" />
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
        {/* Ajattelin, että tähän loppuun olisi hyvä sijoittaa tällainen pieni disclaimer.
        Turnaus- ja asesäännöt löytyvät nettisivuilta eli sinne linkki,
        ja tietosuojaselosteen voisi sijoittaa modal boxiin,
        jonka voi sulkea ja avata nappia painamalla */}
        Ilmoittautuessasi turnaukseeen hyväksyt tietosuojaselosteen sekä
        Helsingin yliopiston salamurhaajien turnaus- ja asesäännöt
      </p>
    </div>
  );
}
