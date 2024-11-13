import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import TextInput from "../TextInput";
import GdprModal from "../../GdprModal";

import { PlayerTitle } from "../../../lib/constants";
import Markdown from "../../Common/Markdown";

const BottomText = () => {
  return (
    <Box sx={{ my: 3, wordWrap: "break-word" }}>
      Ilmoittautuessasi turnaukseen hyväksyt Helsingin yliopiston
      salamurhaajien 
      <Link
        href={"https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"}
        passHref
      >
        <u>turnaussäännöt</u>
      </Link>
      sekä
      <GdprModal text="tietosuojakäytännön" />.
    </Box>
  );
};

const PlayerDetailsForm = ({
  dates,
  handleSubmit,
  isLoading
}: {
  dates: string[];
  handleSubmit: (values: any) => Promise<void>;
  isLoading: boolean;
}) => {
  const calendarInitials = dates.map((_, index) => ({
    [`calendar${index}`]: ""
  }));
  const initialFields = {
    alias: "",
    title: undefined,
    address: "",
    learningInstitution: "",
    eyeColor: "",
    hair: "",
    height: 0,
    other: "",
    security: ""
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={Object.assign(initialFields, ...calendarInitials)}
      validationSchema={Yup.object({
        alias: Yup.string().required("Pakollinen")
      })}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
    >
      <Form>
        <TextInput label="Peitenimi" id="alias" name="alias" type="text" />
        <Box sx={{ marginBottom: "8px" }}>
          <div style={{ width: "100%" }}>
            <label htmlFor="title">Ammattilaistitteli</label>
          </div>
          <Field name="title" id="title" as="select">
            <option>Ei titteliä</option>
            <option value={PlayerTitle.KK}>{PlayerTitle.KK}</option>
            <option value={PlayerTitle.MM}>{PlayerTitle.MM}</option>
            <option value={PlayerTitle.LL}>{PlayerTitle.LL}</option>
            <option value={PlayerTitle.TT}>{PlayerTitle.TT}</option>
          </Field>
        </Box>
        <TextInput
          label="Osoite"
          id="address"
          name="address"
          autoComplete="home"
          type="text"
        />
        <TextInput
          label="Oppilaitos"
          id="learningInstitution"
          name="learningInstitution"
          type="text"
        />
        <TextInput label="Silmät" id="eyeColor" name="eyeColor" type="text" />
        <TextInput label="Hiukset" id="hair" name="hair" type="text" />
        <TextInput label="Pituus" id="height" name="height" type="text" />
        <div style={{ marginBottom: "7px" }}>
          <label htmlFor="safetyNotes">
            Turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja
            paikat)
          </label>
          <Field name="safetyNotes" id="safetyNotes" as="textarea" />
        </div>
        <div style={{ marginBottom: "7px" }}>
          <label htmlFor="other">Muut tiedot, kulkuneuvot yms.</label>
          <Field name="other" id="other" as="textarea" />
        </div>

        <h3>Kalenteritiedot</h3>
        <Box sx={{ mb: 2 }}>
          <Markdown>
            *Kalenteri tukee
            [Markdown-syntaksia](https://www.markdownguide.org/basic-syntax/)*
          </Markdown>
        </Box>
        {dates.map((date: string, index) => (
          <div key={index}>
            <label htmlFor={`calendar${index}`}>{date}</label>
            <Field
              name={`calendar${index}`}
              id={`calendar${index}`}
              as="textarea"
            />
          </div>
        ))}

        <BottomText />
        <LoadingButton loading={isLoading} type="submit">
          Ilmoittaudu
        </LoadingButton>
      </Form>
    </Formik>
  );
};

export default PlayerDetailsForm;
