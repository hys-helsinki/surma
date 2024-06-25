import { Field, Form, Formik, useField } from "formik";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import prisma from "../lib/prisma";
import * as Yup from "yup";
import { useState } from "react";
import Link from "next/link";
import GdprModal from "./GdprModal";
import logo from "/public/images/surma_logo.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";

const TextInput = ({ label, ...props }) => {
  const [field, meta] = useField(props.name);
  return (
    <div style={{marginBottom: "7px"}}>
      <label htmlFor={props.name}>{label}</label>
      {meta.touched && meta.error ? (
        <div className="registration-error">{meta.error}</div>
      ) : null}
      <input {...field} {...props} />
    </div>
  );
};

export default function PlayerForm({ tournament }) {
  const { data, status } = useSession()
  const [fileInputState, setFileInputState] = useState("")
  const [selectedFile, setSelectedFile] = useState()
  const [selectedFileName, setSelectedFileName] = useState("")
  const router = useRouter()

  console.log(data, status)

  const { tournamentId } = router.query;

  if (status === "unauthenticated") {
    return (<h2>User not found</h2>)
  }

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);
  let dates: Array<any> = [];
  dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
  let loopDay = start;
  while (loopDay < end) {
    loopDay.setDate(loopDay.getDate() + 1);
    dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
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

  const handleSubmit = async (values) => {
    const userId = data.user.id
    const playerData = {tournamentId, userId, ...values}
    console.log(playerData)
    const response = await fetch("/api/player/create", {
      method: "POST",
      body: JSON.stringify(playerData)
    })
    const createdPlayer = await response.json()
    console.log(createdPlayer)
    router.reload()
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
          <p>
            Tervetuloa ilmoittatumaan turnaukseen &quot;{tournament.name}&quot;.
            Nimi, puhelinnumero, sähköpostiosoite sekä peitenimi ovat pakollisia
            kenttiä, muut kentät voi täyttää ilmoittautumisen jälkeenkin mutta
            mieluusti ennen turnauksen alkua. Lisääthän myös kuvan itsestäsi
            ilmoittautumisen yhteydessä!
          </p>
          <p>
            Kalenterin tiedot tulee pitää ajan tasalla sekä riittävän selkeinä
            ja yksityiskohtaisina. Jokaista sekuntia siihen ei tarvitse
            kirjoittaa, mutta pelistä tulee hauskempaa itsellesi sekä
            jahtaajillesi jos tarjoat heille riittävästi tilaisuuksia.
            Kalenterin tietoja pystyy muokkaamaan turnauksen aikana.
          </p>
          <p>
            Puhelinnumero, sähköpostiosoite ja peitenimesi ovat ainoastaan
            tuomariston tiedossa. Pelaajat, jotka saavat sinut kohteekseen,
            näkevät muut tiedot.
          </p>
          <form>
            <label>Valitse kuva itsestäsi (näkyy jahtaajillesi)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileInputChange}
              value={fileInputState}
            />
          </form>
          {selectedFileName ? (
            <p>Valittu tiedosto: {selectedFileName}</p>
          ) : null}
          <Formik
            enableReinitialize={true}
            initialValues={{
              calendar: [...new Array(dates.length).fill("")],
              alias: "",
              title: "noValue",
              phone: "",
              address: "",
              learningInstitution: "",
              eyeColor: "",
              hair: "",
              height: 0,
              glasses: "",
              other: "",
            }}
            validationSchema={Yup.object({
              alias: Yup.string().required("Pakollinen"),
              phone: Yup.number()
                .required("Pakollinen")
                .positive("Puhelinnumero ei voi sisältää negatiivisia lukuja")
                .integer("Syötä vain numeroita"),
            })}
            onSubmit={(values) => {
              handleSubmit(values)
          }}
          >
            <Form>

              <TextInput label="Puhelinnumero" name="phone" type="text" />

              <TextInput label="Peitenimi" name="alias" type="text" />

              <div style={{marginBottom: "8px"}}>
                <div style={{width: "100%"}}><label>Ammattilaistitteli</label></div>
                <Field name="title" as="select">
                  <option value="noValue">Ei titteliä</option>
                  <option value="KK">KK</option>
                  <option value="MM">MM</option>
                  <option value="TT">TT</option>
                </Field>
              </div>

              <TextInput label="Osoite" name="address" type="text" />

              <TextInput
                label="Oppilaitos"
                name="learningInstitution"
                type="text"
              />

              <TextInput label="Silmät" name="eyeColor" type="text" />

              <TextInput label="Hiukset" name="hair" type="text" />

              <TextInput label="Pituus" name="height" type="text" />

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
          <div style={{ marginBottom: "20px" }}>
            Ilmoittautuessasi turnaukseeen hyväksyt Helsingin yliopiston
            salamurhaajien&nbsp;
            <Link
              href={
                "https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"
              }
              passHref
            >
              <a style={{ color: "red" }}>turnaus</a>
            </Link>
            - ja
            <Link
              href={"https://salamurhaajat.net/mika-salamurhapeli/asesaannot"}
              passHref
            >
              <a style={{ color: "red" }}>asesäännöt</a>
            </Link>
            &nbsp;sekä&nbsp;
            <GdprModal />
          </div>
        </div>
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </div>
  );
}