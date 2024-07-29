import { Box } from "@mui/material";

const PlayerInfo = ({ user, currentUserIsUmpire }): JSX.Element => {

  //testidataaa
  return (
    <Box sx={{mt: 4}}>
      <h3>Yhteystiedot</h3>
      <p>puhelinnumero: {user.phone}</p>
      <p>email: {user.email}</p>

      {currentUserIsUmpire &&

      <><h3>Käyttäjän viime käynti</h3><p>20434390242</p></>}
    </Box>
  );
};

export default PlayerInfo
