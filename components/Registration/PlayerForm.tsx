import { Field, Form, Formik, FormikValues, useField } from "formik";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useState } from "react";
import Link from "next/link";
import GdprModal from "../GdprModal";
import logo from "/public/images/surma_logo.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { LoadingButton } from "@mui/lab";
import TextInput from "./TextInput";
import { Box, Container } from "@mui/material";

const BottomText = () => {
  return (
    <Box sx={{ my: 3 }}>
      Ilmoittautuessasi turnaukseeen hyväksyt Helsingin yliopiston salamurhaajien&nbsp; 
      <Link
        href={
          "https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"
        }
        passHref
      >
        <a style={{ color: "red" }}>turnaus</a>
      </Link>
      - ja&nbsp;
      <Link
        href={"https://salamurhaajat.net/mika-salamurhapeli/asesaannot"}
        passHref
      >
        <a style={{ color: "red" }}>asesäännöt</a>
      </Link>
      &nbsp;sekä&nbsp;
      <GdprModal />
    </Box>
  )
}

export default function PlayerForm({ tournament }) {
  const { data, status } = useSession()
  const [fileInputState, setFileInputState] = useState("")
  const [selectedFile, setSelectedFile] = useState()
  const [selectedFileName, setSelectedFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const tournamentId = tournament.id

  if (status === "unauthenticated") {
    return (<h2>User not found</h2>)
  }

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);

  const dates: Array<string> = [];
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

  const handleSubmit = async (values) => {
    setIsLoading(true)
    const userId = data.user.id
    const playerData = {tournamentId, userId, ...values}
    try {
      const response = await fetch("/api/player/create", {
        method: "POST",
        body: JSON.stringify(playerData)
      })
      const createdPlayer = await response.json()
      await uploadImage(createdPlayer.id)
      router.reload()
    } catch (error) {
      console.log(error)
    }

  }

  return (
    <Container maxWidth="md">
      {new Date().getTime() <
      new Date(tournament.registrationEndTime).getTime() ? (
        <>
          <Box sx={{display: "flex"}}>
            <Image src={logo} width={60} height={60} alt="logo" />
            <h1 style={{marginLeft: "10px"}}>Ilmoittautuminen</h1>
          </Box>
          <Box sx={{my: 4}}>
            <p>
              Tässä lomakkeessa kysytään turnauksen kannalta olennaisia tietoja, jotka näkyvät jahtaajillesi. Lomakkeen täyttämisen jälkeen tuomaristo vahvistaa vielä ilmoittautumisesi.
            </p>
            <p>
              Ainoastaan peitenimi on tässä vaiheessa pakollinen - muut kentät voi täyttää myöhemminkin ja niitä voi muokata turnauksen aikana.
            </p>
            <p>
              Kalenterin tiedot tulee pitää ajan tasalla sekä riittävän selkeinä
              ja yksityiskohtaisina. Jokaista sekuntia siihen ei tarvitse
              kirjoittaa, mutta pelistä tulee hauskempaa itsellesi sekä
              jahtaajillesi jos tarjoat heille riittävästi tilaisuuksia salamurhaamiseen. 
            </p>
          </Box>
          <form>
            <label>Valitse kuva itsestäsi</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileInputChange}
              value={fileInputState}
            />
          </form>
          {selectedFileName ? (
            <p><i>Valittu tiedosto: {selectedFileName}</i></p>
          ) : null}
          <Formik
            enableReinitialize={true}
            initialValues={{
              calendar: [...new Array(dates.length).fill("")],
              alias: "",
              title: "noTitle",
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
            })}
            onSubmit={(values) => {
              handleSubmit(values)
          }}
          >
            <Form>
              <TextInput label="Peitenimi" name="alias" type="text" />
              <Box sx={{marginBottom: "8px"}}>
                <div style={{width: "100%"}}>
                  <label>Ammattilaistitteli</label>
                </div>
                <Field name="title" as="select">
                  <option value="noTitle">Ei titteliä</option>
                  <option value="KK">KK</option>
                  <option value="MM">MM</option>
                  <option value="TT">TT</option>
                </Field>
              </Box>
              <TextInput label="Osoite" name="address" type="text" />
              <TextInput
                label="Oppilaitos"
                name="learningInstitution"
                type="text"
              />
              <TextInput label="Silmät" name="eyeColor" type="text" />
              <TextInput label="Hiukset" name="hair" type="text" />
              <TextInput label="Pituus" name="height" type="text" />
              <div style={{marginBottom: "7px"}}>
                <label>Turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja paikat)</label>
                <Field name="security" as="textarea" />
              </div>
              <div style={{marginBottom: "7px"}}>
                <label>Muut tiedot, kulkuneuvot yms.</label>
                <Field name="other" as="textarea" />
              </div>
              <h3>Kalenteritiedot</h3>
              {dates.map((d: string, i) => (
                <div key={i}>
                  <label>{d}</label>
                  <Field name={`calendar[${i}]`} as="textarea" />
                </div>
              ))}
              <BottomText />
              <LoadingButton loading={isLoading} type="submit">
                Ilmoittaudu
              </LoadingButton>
            </Form>
          </Formik>
        </>
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </Container>
  );
}