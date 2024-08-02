import { Box } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton";
import { Field, Form, Formik } from "formik"
import * as Yup from "yup";
import Link from "next/link";
import TextInput from "../TextInput"
import GdprModal from "../../GdprModal";

import { KK, MM, LL, TT } from '../../../constants'

const BottomText = () => {
    return (
      <Box sx={{ my: 3, wordWrap: "break-word"}}>
        Ilmoittautuessasi turnaukseen hyväksyt Helsingin yliopiston salamurhaajien&nbsp; 
        <Link
          href={
            "https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"
          }
          passHref
        >
          <a><u>turnaussäännöt</u></a>
        </Link>
        &nbsp;sekä&nbsp;
        <GdprModal text="tietosuojakäytännön"/>.
      </Box>
    )
  }

const PlayerDetailsForm = ({dates, handleSubmit, isLoading}: {dates: string[], handleSubmit: (values: any) => Promise<void>, isLoading: boolean}) => {
    return (
      <Formik
        enableReinitialize={true}
        initialValues={{
          calendar: [...new Array(dates.length).fill("")],
          alias: "",
          title: undefined,
          address: "",
          learningInstitution: "",
          eyeColor: "",
          hair: "",
          height: "",
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
        <TextInput label="Peitenimi" id="alias" name="alias" type="text" />
        <Box sx={{marginBottom: "8px"}}>
          <div style={{width: "100%"}}>
            <label htmlFor="title">Ammattilaistitteli</label>
          </div>
          <Field name="title" id="title" as="select">
            <option>Ei titteliä</option>
            <option value={KK}>{KK}</option>
            <option value={MM}>{MM}</option>
            <option value={LL}>{LL}</option>
            <option value={TT}>{TT}</option>
          </Field>
        </Box>
        <TextInput label="Osoite" id="address" name="address" autoComplete="home" type="text" />
        <TextInput
          label="Oppilaitos"
          id="learningInstitution"
          name="learningInstitution"
          type="text"
        />
        <TextInput label="Silmät" id="eyeColor" name="eyeColor" type="text" />
        <TextInput label="Hiukset" id="hair" name="hair" type="text" />
        <TextInput label="Pituus" id="height" name="height" type="text" />
        <div style={{marginBottom: "7px"}}>
          <label htmlFor="security">Turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja paikat)</label>
          <Field name="security" id="security" as="textarea" />
        </div>
        <div style={{marginBottom: "7px"}}>
          <label htmlFor="other">Muut tiedot, kulkuneuvot yms.</label>
          <Field name="other" id="other" as="textarea" />
        </div>
  
        <h3>Kalenteritiedot</h3>
        {dates.map((d: string, i) => (
          <div key={i}>
            <label htmlFor={`calendar[${i}]`}>{d}</label>
            <Field name={`calendar[${i}]`} id={`calendar[${i}]`} as="textarea" />
          </div>
        ))}
  
        <BottomText />
        <LoadingButton loading={isLoading} type="submit">
          Ilmoittaudu
        </LoadingButton>
      </Form>
    </Formik>
    )
  }

  export default PlayerDetailsForm
  