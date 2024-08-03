import { Box } from "@mui/material";
import { UpdateForm } from "./UpdateForm";
import { useState } from "react";
import { useRouter } from "next/router";

type FormData = {
  address: string;
  learningInstitution: string;
  eyeColor: string;
  hair: string;
  height: number;
  other: string;
};

const PlayerDetails = ({ user }) => {
  const [isUpdated, setIsUpdated] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  const player = user.player;

  const handleDetailsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const data: FormData = {
      address: event.currentTarget.address.value,
      learningInstitution: event.currentTarget.learningInstitution.value,
      eyeColor: event.currentTarget.eyeColor.value,
      hair: event.currentTarget.hair.value,
      height: parseInt(event.currentTarget.height.value),
      other: event.currentTarget.other.value
    };
    try {
      await fetch(`/api/user/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      router.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      {isUpdated ? (
        <Box sx={{ mt: 4 }}>
          <h3>Kuvaus</h3>
          <p>
            <b>Osoite:</b> {player.address}
          </p>
          <p>
            <b>Opinahjo:</b> {player.learningInstitution}
          </p>
          <p>
            <b>Silmät:</b> {player.eyeColor}
          </p>
          <p>
            <b>Hiukset:</b> {player.hair}
          </p>
          <p>
            <b>Pituus:</b> {player.height}
          </p>
          <p>
            <b>Ulkonäkö, kulkuvälineet ja muut lisätiedot:</b> {player.other}
          </p>
        </Box>
      ) : (
        <UpdateForm data={user.player} handleSubmit={handleDetailsSubmit} />
      )}
      <button onClick={() => setIsUpdated(!isUpdated)}>
        {isUpdated ? "Muokkaa tietoja" : "Peruuta"}
      </button>
    </Box>
  );
};

export default PlayerDetails;
