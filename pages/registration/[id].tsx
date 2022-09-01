import { Field, Form, Formik, useField } from "formik";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import prisma from "../../lib/prisma";
import * as Yup from "yup";
import { useState } from "react";


export const getStaticProps: GetStaticProps = async ({ params }) => {
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.id as string
    },
    select: {
      id: true,
      name: true,
      start: true,
      end: true,
      registrationStart: true,
      registrationEnd: true
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
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");

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
    if (!selectedFile) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        await fetch("api/upload", {
          method: "POST",
          body: JSON.stringify({
            url: reader.result,
            publicId: id
          })
        });
      };
      setFileInputState("");
      setSelectedFileName("");
      setSelectedFile(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file == undefined) {
      setFileInputState("");
      setSelectedFile(null);
      setSelectedFileName("");
    } else {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setFileInputState(event.target.value);
    }
  };

  return (
    <div>
      <div className="registration-form">
        <h1 className="registration-form-title">Ilmoittautuminen</h1>
        <form>
          <label>Valitse kuva</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileInputChange}
            value={fileInputState}
          />
        </form>
        {selectedFileName ? <p>Valittu tiedosto: {selectedFileName}</p> : null}
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