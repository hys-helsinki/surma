import { Box, Button } from "@mui/material";
import { Field, Form, Formik } from "formik";
import TextInput from "../../Registration/TextInput";

export const UpdateForm = ({ player, handleSubmit }): JSX.Element => {
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
        security: player.security
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
          <Field name="security" as="textarea" />
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
        <Button type="submit">Tallenna tiedot</Button>
      </Form>
    </Formik>
  );
};
