import { Box } from "@mui/material";

const PlayerDetails = ({ player }) => {
  return (
    <Box sx={{mt: 4}}>
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
  );
};

export default PlayerDetails
