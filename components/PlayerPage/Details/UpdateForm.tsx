import { Field, Form, Formik } from "formik";
import TextInput from "../../Registration/TextInput";
import LoadingButton from "@mui/lab/LoadingButton";

export const UpdateForm = ({
  player,
  handleSubmit,
  isLoading
}): JSX.Element => {
  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        address: player.address,
        learningInstitution: player.learningInstitution,
        eyeColor: player.eyeColor,
        hair: player.hair,
        height: player.height,
        other: player.other,
        safetyNotes: player.safetyNotes
      }}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
    >
      <Form>
        <div style={{ marginBottom: "7px" }}>
          <label>
            Turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja
            paikat)
          </label>
          <Field name="safetyNotes" as="textarea" />
        </div>
        <TextInput label="Osoite" name="address" type="text" />
        <TextInput label="Opinahjo" name="learningInstitution" type="text" />
        <TextInput label="Silmät" name="eyeColor" type="text" />
        <TextInput label="Hiukset" name="hair" type="text" />
        <TextInput label="Pituus" name="height" type="text" />
        <div style={{ marginBottom: "7px" }}>
          <label>Ulkonäkö, kulkuvälineet ja muut lisätiedot:</label>
          <Field name="other" as="textarea" />
        </div>
        <LoadingButton loading={isLoading} type="submit">
          Tallenna
        </LoadingButton>
      </Form>
    </Formik>
  );
};
