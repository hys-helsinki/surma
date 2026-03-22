import { Box, Button } from "@mui/material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import TextInput from "../../Common/TextInput";
import { PlayerTitle } from "../../../lib/constants";
import Markdown from "../../Common/Markdown";
import GdprModal from "../../GdprModal";

const BottomText = () => {
  const { t } = useTranslation("common");
  return (
    <Box sx={{ my: 3, wordWrap: "break-word" }}>
      <div>
        {t("playerForm.agreedTo")}{" "}
        <Link
          href={"https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"}
          passHref
        >
          {t("playerForm.tournamentRulesLink")}
        </Link>{" "}
        {t("playerForm.and")}{" "}
      </div>
      <GdprModal text={t("playerForm.privacyPolicyLink")} />.
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
  const { t } = useTranslation("common");

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
    height: "",
    other: "",
    safetyNotes: ""
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={Object.assign(initialFields, ...calendarInitials)}
      validationSchema={Yup.object({
        alias: Yup.string().required(t("playerForm.required")),
        address: Yup.string().required(t("playerForm.required"))
      })}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
    >
      <Form>
        <TextInput
          label={t("playerForm.alias")}
          id="alias"
          name="alias"
          type="text"
        />
        <Box sx={{ marginBottom: "8px" }}>
          <div style={{ width: "100%" }}>
            <label htmlFor="title">{t("playerForm.professionalTitle")}</label>
          </div>
          <Field name="title" id="title" as="select">
            <option>{t("playerForm.noTitle")}</option>
            <option value={PlayerTitle.KK}>{PlayerTitle.KK}</option>
            <option value={PlayerTitle.MM}>{PlayerTitle.MM}</option>
            <option value={PlayerTitle.LL}>{PlayerTitle.LL}</option>
            <option value={PlayerTitle.TT}>{PlayerTitle.TT}</option>
          </Field>
        </Box>
        <TextInput
          label={t("playerForm.address")}
          id="address"
          name="address"
          autoComplete="home"
          type="text"
        />
        <TextInput
          label={t("playerForm.learningInstitution")}
          id="learningInstitution"
          name="learningInstitution"
          type="text"
        />
        <TextInput
          label={t("playerForm.eyeColor")}
          id="eyeColor"
          name="eyeColor"
          type="text"
        />
        <TextInput
          label={t("playerForm.hair")}
          id="hair"
          name="hair"
          type="text"
        />
        <TextInput
          label={t("playerForm.height")}
          id="height"
          name="height"
          type="text"
        />
        <TextInput
          label={t("playerForm.safetyNotes")}
          name="safetyNotes"
          type="text"
          textArea
        />
        <TextInput
          label={t("playerForm.otherInfo")}
          id="other"
          name="other"
          type="text"
          textArea
        />

        <h3>{t("playerForm.calendarTitle")}</h3>
        <Box sx={{ mb: 2 }}>
          <Markdown>{t("playerForm.calendarMarkdown")}</Markdown>
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
        <Button loading={isLoading} type="submit">
          {t("playerForm.registerButton")}
        </Button>
      </Form>
    </Formik>
  );
};

export default PlayerDetailsForm;
