import { useRouter } from "next/router";
import { useState } from "react";
import logo from "/public/images/surma_logo.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Box, Container } from "@mui/material";
import PlayerDetailsForm from "./PlayerDetailsForm";
import ImageUploadForm from "./ImageUploadForm";

export default function PlayerForm({ tournament }) {
  const { data, status } = useSession()
  const [fileInputState, setFileInputState] = useState("")
  const [selectedFile, setSelectedFile] = useState()
  const [selectedFileName, setSelectedFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const tournamentId = tournament.id

  if (status === "unauthenticated") {
    return (<h2>User not found</h2>)
  }

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);

  const isRegistrationOpen = new Date().getTime() < new Date(tournament.registrationEndTime).getTime()

  const dates: Array<string> = [];
  dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
  let loopDay = start;
  while (loopDay < end) {
    loopDay.setDate(loopDay.getDate() + 1);
    dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
  }

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
    setIsLoading(true)
    const userId = data.user.id
    const playerData = {tournamentId, userId, ...values}
    try {
      const response = await fetch("/api/player/create", {
        method: "POST",
        body: JSON.stringify(playerData)
      })
      const createdPlayer = await response.json()
      await uploadImage(createdPlayer.id)
      router.reload()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container maxWidth="md">
      {isRegistrationOpen ? (
        <Box>
          <Box sx={{display: "flex"}}>
            <Image src={logo} width={60} height={60} alt="logo" />
            <h1 style={{marginLeft: "10px"}}>Ilmoittautuminen</h1>
          </Box>
          <Box sx={{ my: 4 }}>
            <p>
                Tässä lomakkeessa kysytään turnauksen kannalta olennaisia tietoja, jotka näkyvät jahtaajillesi. Lomakkeen täyttämisen jälkeen tuomaristo vahvistaa vielä ilmoittautumisesi.
            </p>
            <p>
                Ainoastaan peitenimi on tässä vaiheessa pakollinen - muut kentät voi täyttää myöhemminkin ja niitä voi muokata turnauksen aikana.
            </p>
            <p>
                Kalenterin tiedot tulee pitää ajan tasalla sekä riittävän selkeinä
                ja yksityiskohtaisina. Jokaista sekuntia siihen ei tarvitse
                kirjoittaa, mutta pelistä tulee hauskempaa itsellesi sekä
                jahtaajillesi jos tarjoat heille riittävästi tilaisuuksia salamurhaamiseen.
            </p>
          </Box>
          <ImageUploadForm 
            setSelectedFile={setSelectedFile}
            setSelectedFileName={setSelectedFileName}
            setFileInputState={setFileInputState}
            selectedFileName={selectedFileName}
            fileInputState={fileInputState}
          />
          <PlayerDetailsForm dates={dates} handleSubmit={handleSubmit} isLoading={isLoading} />
        </Box>
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </Container>
  );
}