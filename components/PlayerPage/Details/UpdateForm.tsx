import { Field, Form, Formik } from "formik";
import TextInput from "../../Registration/TextInput";
import { Dispatch, JSX, SetStateAction, useContext, useState } from "react";
import { useTranslation } from "next-i18next";
import { UserContext, UserWithPlayer } from "../../UserProvider";
import { Button } from "@mui/material";

type FormData = {
  address: string;
  learningInstitution: string;
  eyeColor: string;
  hair: string;
  height: number;
  other: string;
  safetyNotes: string;
};

export const UpdateForm = ({
  setUser,
  setIsUpdating
}: {
  setUser: Dispatch<SetStateAction<UserWithPlayer>>;
  setIsUpdating: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  const { t } = useTranslation("common");
  const user = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const player = user.player;

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const data: FormData = values;
    try {
      const response = await fetch(`/api/user/update/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      const updatedUser = await response.json();
      setIsLoading(false);
      setIsUpdating(false);
      setUser(updatedUser);
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
          <label>{t("playerPage.details.updateForm.safetyNotesLabel")}</label>
          <Field name="safetyNotes" as="textarea" />
        </div>
        <TextInput
          label={t("playerPage.details.updateForm.addressLabel")}
          name="address"
          type="text"
        />
        <TextInput
          label={t("playerPage.details.updateForm.learningInstitutionLabel")}
          name="learningInstitution"
          type="text"
        />
        <TextInput
          label={t("playerPage.details.updateForm.eyeColorLabel")}
          name="eyeColor"
          type="text"
        />
        <TextInput
          label={t("playerPage.details.updateForm.hairLabel")}
          name="hair"
          type="text"
        />
        <TextInput
          label={t("playerPage.details.updateForm.heightLabel")}
          name="height"
          type="text"
        />
        <div style={{ marginBottom: "7px" }}>
          <label>{t("playerPage.details.updateForm.otherInfoLabel")}</label>
          <Field name="other" as="textarea" />
        </div>
        <Button loading={isLoading} type="submit">
          {t("playerPage.details.updateForm.saveButton")}
        </Button>
      </Form>
    </Formik>
  );
};
