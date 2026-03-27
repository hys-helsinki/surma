import { useState } from "react";
import { useSession } from "next-auth/react";
import { Alert, Box, Container, Snackbar } from "@mui/material";
import { useTranslation } from "next-i18next";
import PlayerDetailsForm from "./PlayerDetailsForm";
import ImageUploadForm from "../../Common/ImageUploadForm";
import { getTournamentDates } from "../../utils";

export default function PlayerForm({
  tournament,
  setUser,
  setImageUrl,
  imageUrl
}) {
  const { t, i18n } = useTranslation("common");
  const { data, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [showFormError, setShowFormError] = useState(false);

  const tournamentId = tournament.id;
  const locale = i18n.language || "fi";

  if (status === "loading") {
    return;
  }

  if (status === "unauthenticated") {
    return <h2>{t("playerForm.userNotFound")}</h2>;
  }

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);

  const isRegistrationOpen =
    new Date().getTime() >
      new Date(tournament.registrationStartTime).getTime() &&
    new Date().getTime() < new Date(tournament.registrationEndTime).getTime();

  const dates = getTournamentDates(start, end);

  const handleSubmit = async (values) => {
    setIsLoading(true);

    const calendar = dates.map((date, index) => [
      date,
      values[`calendar${index}`]
    ]);

    const {
      address,
      alias,
      eyeColor,
      hair,
      height,
      learningInstitution,
      other,
      safetyNotes,
      title
    } = values;

    const userId = data.user.id;

    const playerData = {
      tournamentId,
      userId,
      address,
      alias,
      eyeColor,
      hair,
      height,
      learningInstitution,
      other,
      safetyNotes,
      title,
      calendar
    };

    try {
      const response = await fetch(`/api/player/create?locale=${locale}`, {
        method: "POST",
        body: JSON.stringify(playerData)
      });
      const responseObject = await response.json();
      if (response.status === 200) {
        setUser((prev) => ({ ...prev, player: responseObject.player }));
      } else {
        setFormErrorMessage(t("playerForm.error"));
        setShowFormError(true);
        console.log(responseObject.message);
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  return (
    <Container maxWidth="md">
      {isRegistrationOpen ? (
        <Box>
          <h1>{t("playerForm.title")}</h1>
          <Box sx={{ my: 4 }}>
            <p>{t("playerForm.description")}</p>
            <p>{t("playerForm.mandatoryFields")}</p>
            <p>{t("playerForm.calendarInfo")}</p>
          </Box>
          <Box sx={{ my: 2 }}>
            {!imageUrl ? (
              <ImageUploadForm
                setImageUrl={setImageUrl}
                tournamentId={tournamentId}
                userId={data.user.id}
                uploadLabel={t("imageUpload.uploadLabel")}
              />
            ) : (
              <i>
                <b>{t("imageUpload.imageUploaded")}</b>
              </i>
            )}
          </Box>
          <PlayerDetailsForm
            dates={dates}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Box>
      ) : (
        <p>{t("playerForm.registrationNotOpen")}</p>
      )}
      <Snackbar open={showFormError} onClose={() => setShowFormError(false)}>
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setShowFormError(false)}
        >
          {formErrorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
