import { useRouter } from "next/router";
import { Formik, Form, Field } from "formik";
import React from "react";

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

          <label>Sukunimi</label>
          <Field name="lastName" />

          <label>Alias</label>
          <Field name="alias" />

          <label>Email</label>
          <Field name="email" />

          <label>Puhelinnumero</label>
          <Field name="phone" />

          <label>Osoite</label>
          <Field name="address" />

          <label>Oppilaitos</label>
          <Field name="learningInstitution" />

          <label>Silmät</label>
          <Field name="eyeColor" />

          <label>Hiukset</label>
          <Field name="hair" />

          <label>Pituus</label>
          <Field name="height" type="number" />

          <label>Silmälasit</label>
          <Field name="glasses" />

          <label>Muu</label>
          <Field name="other" />
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
    </div>
  );
}
