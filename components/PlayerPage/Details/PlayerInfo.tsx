import { Box, Button, IconButton } from "@mui/material";
import { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const PlayerInfo = ({ user, currentUserIsUmpire, umpires }: {user: any, currentUserIsUmpire: boolean, umpires: any[]}): JSX.Element => {

  // const playerUmpire = user.player.umpire

  const [showOtherUmpires, setShowOtherUmpires] = useState(false)

  const testUmpire = {user: {firstName: "test", lastName: "test", phone: "1111", email: "test@test"}}

  //testidataaa
  return (
    <Box sx={{mt: 4}}>
      <h2>Yhteystiedot</h2>
      <p>puhelinnumero: {user.phone}</p>
      <p>email: {user.email}</p>

      {currentUserIsUmpire &&
      <><h3>Käyttäjän viime käynti</h3><p>20434390242</p></>}

      <Box sx={{mt: 4}}>
        <p></p>
        <h3>Pelaajan tuomari</h3>
        <p>{testUmpire.user.firstName} {testUmpire.user.lastName}</p>
        <p>{testUmpire.user.email}</p>
        <p>{testUmpire.user.phone}</p>
      </Box>

      {umpires && umpires.length !== 0 && (
        <div>
          <h4 style={{display: "inline"}}>Muut tuomarit</h4><Button onClick={() => setShowOtherUmpires(!showOtherUmpires)} sx={{color: "white"}}>{showOtherUmpires ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</Button>
          {
            showOtherUmpires ? (
            <div>
            {umpires.map(umpire => (
            <div key={umpire.id}><p>{umpire.user.firstName} {umpire.user.lastName}</p><p>{umpire.user.email}</p><p>{umpire.user.phone}</p></div>
          ))}</div>
            ) : null
          }
          
        </div>)}
    </Box>
  );
};

export default PlayerInfo
