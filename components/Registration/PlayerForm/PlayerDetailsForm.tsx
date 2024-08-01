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
        Ilmoittautuessasi turnaukseeen hyväksyt Helsingin yliopiston salamurhaajien&nbsp; 
        <Link
          href={
            "https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"
          }
          passHref
        >
          <a><u>turnaussäännöt</u></a>
        </Link>
        &nbsp;sekä&nbsp;
        <GdprModal text="tietosuojailmoituksen"/>.
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
        <TextInput label="Peitenimi" name="alias" type="text" />
        <Box sx={{marginBottom: "8px"}}>
          <div style={{width: "100%"}}>
            <label>Ammattilaistitteli</label>
          </div>
          <Field name="title" as="select">
            <option>Ei titteliä</option>
            <option value={KK}>{KK}</option>
            <option value={MM}>{MM}</option>
            <option value={LL}>{LL}</option>
            <option value={TT}>{TT}</option>
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
    )
  }

  export default PlayerDetailsForm
  