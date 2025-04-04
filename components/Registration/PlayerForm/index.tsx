import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Box, Container } from "@mui/material";
import PlayerDetailsForm from "./PlayerDetailsForm";
import ImageUploadForm from "./ImageUploadForm";
import { getTournamentDates } from "../../utils";

export default function PlayerForm({ tournament }) {
  const { data, status } = useSession();
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const tournamentId = tournament.id;

  if (status === "unauthenticated") {
    return <h2>User not found</h2>;
  }

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);

  const isRegistrationOpen =
    new Date().getTime() >
      new Date(tournament.registrationStartTime).getTime() &&
    new Date().getTime() < new Date(tournament.registrationEndTime).getTime();

  const dates = getTournamentDates(start, end);

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
      const response = await fetch("/api/player/create", {
        method: "POST",
        body: JSON.stringify(playerData)
      });
      const createdPlayer = await response.json();
      await uploadImage(createdPlayer.id);
      router.reload();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <Container maxWidth="md">
      {isRegistrationOpen ? (
        <Box>
          <h1 style={{ marginLeft: "10px" }}>Ilmoittautuminen</h1>
          <Box sx={{ my: 4 }}>
            <p>
              Tässä lomakkeessa kysytään turnauksen kannalta olennaisia tietoja,
              jotka näkyvät jahtaajillesi. Lomakkeen täyttämisen jälkeen
              tuomaristo vahvistaa vielä ilmoittautumisesi.
            </p>
            <p>
              Ainoastaan peitenimi ja osoite ovat tässä vaiheessa pakollisia -
              muut kentät voi täyttää myöhemminkin ja niitä voi muokata
              turnauksen aikana.
            </p>
            <p>
              Kalenterin tiedot tulee pitää ajan tasalla sekä riittävän selkeinä
              ja yksityiskohtaisina. Jokaista sekuntia siihen ei tarvitse
              kirjoittaa, mutta pelistä tulee hauskempaa itsellesi sekä
              jahtaajillesi jos tarjoat heille riittävästi tilaisuuksia
              salamurhaamiseen.
            </p>
          </Box>
          <ImageUploadForm
            setSelectedFile={setSelectedFile}
            setSelectedFileName={setSelectedFileName}
            setFileInputState={setFileInputState}
            selectedFileName={selectedFileName}
            fileInputState={fileInputState}
          />
          <PlayerDetailsForm
            dates={dates}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Box>
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </Container>
  );
}
