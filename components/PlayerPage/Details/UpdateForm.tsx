import { Field, Form, Formik } from "formik";
import TextInput from "../../Registration/TextInput";
import LoadingButton from "@mui/lab/LoadingButton";
import { useState } from "react";
import { useRouter } from "next/router";

type FormData = {
  address: string;
  learningInstitution: string;
  eyeColor: string;
  hair: string;
  height: number;
  other: string;
  safetyNotes: string;
};

export const UpdateForm = ({ player, setPlayer }): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { id } = router.query;

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const data: FormData = values;
    try {
      const response = await fetch(`/api/user/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      const updatedPlayer = await response.json();
      setPlayer(updatedPlayer);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
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
