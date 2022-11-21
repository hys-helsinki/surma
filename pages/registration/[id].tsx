import { Field, Form, Formik, useField } from "formik";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import prisma from "../../lib/prisma";
import * as Yup from "yup";
import { useState } from "react";
import Link from "next/link";
import GdprModal from "../../components/GdprModal";
import logo from "/public/images/surma_logo.svg";
import Image from "next/image";

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
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);
  let dates: Array<any> = [];
  dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
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
        await fetch("/api/upload", {
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
      {new Date().getTime() <
      new Date(tournament.registrationEndTime).getTime() ? (
        <div className="registration-form">
          <div style={{ float: "left", width: "10%" }}>
            <Image src={logo} width={60} height={60} alt="logo" />
          </div>
          <h1 className="registration-form-title">Ilmoittautuminen</h1>
          <p>
            Ilmoittatuminen auki&nbsp;
            {new Date(tournament.registrationEndTime).getDate()}.
            {new Date(tournament.registrationEndTime).getMonth() + 1}. klo&nbsp;
            {new Date(tournament.registrationEndTime).getHours()}:
            {new Date(tournament.registrationEndTime).getMinutes()} asti
          </p>
          <div style={{ paddingBottom: "20px" }}>
            <p>
              Tervetuloa ilmoittatumaan turnaukseen &quot;{tournament.name}
              &quot;. Nimi, puhelinnumero, sähköpostiosoite sekä peitenimi ovat
              pakollisia kenttiä, muut kentät voi täyttää ilmoittautumisen
              jälkeenkin mutta mieluusti ennen turnauksen alkua. Lisääthän myös
              kuvan itsestäsi ilmoittautumisen yhteydessä!
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
            <h3>Huom!</h3>
            <p>
              Turnausjärjestelmä Surma on ensimmäistä kertaa käytössä vuoden
              2022 syysturnauksessa. Jos ilmoittautumisessa tai myöhemmin
              sovelluksen käytössä ilmenee minkäänlaisia ongelmia, ilmoitathan
              viasta tuomaristolle sähköpostitse tuomaristo@salamurhaajat.net.
              Myös kaikenlainen palaute on erittäin tervetullutta!
            </p>
            <p>
              Otathan myös huomioon, että jos painat enteriä kalenterikenttien
              ulkopuolella, lomake lähetetään automaattisesti.
            </p>
            <form>
              <label>
                Valitse kuva itsestäsi (näkyy jahtaajillesi). Maksimikoko 10MB
              </label>
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
          </div>
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
              height: 0,
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
                .integer("Syötä vain numeroita"),
              height: Yup.number()
            })}
            onSubmit={async (values) => {
              const cal = {};
              dates.forEach((x, i) => (cal[x] = values.calendar[i]));
              var data = { ...values, calendar: undefined, tournament };
              data["calendar"] = cal;
              data["tournamentId"] = tournament.id;
              fetch("/api/user/create", {
                method: "POST",
                body: JSON.stringify(data)
              })
                .then((response) => response.json())
                .then((d) => {
                  uploadImage(d.id);
                  router.push({
                    pathname: `/registration/confirm`
                  });
                })
                .catch((e) => console.log(e));
            }}
          >
            <Form>
              <div style={{ float: "left", width: "10%" }}>
                <label>Titteli</label>
                <Field as="select" name="titteli">
                  <option value="">--</option>
                  <option value="KK">KK</option>
                  <option value="MM">MM</option>
                  <option value="LL">LL</option>
                </Field>
              </div>
              <div style={{ float: "left", width: "25%" }}>
                <TextInput label="Etunimi" name="firstName" type="text" />
              </div>
              <div style={{ float: "right", width: "60%" }}>
                <TextInput label="Sukunimi" name="lastName" type="text" />
              </div>
              <div>
                <TextInput label="Peitenimi" name="alias" type="text" />

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
              </div>
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
        <p>Ilmoittatuminen ei ole auki</p>
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
