import { Box, Button, IconButton } from "@mui/material";
import { useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const PlayerInfo = ({
  user,
  currentUserIsUmpire,
  umpires
}: {
  user: any;
  currentUserIsUmpire: boolean;
  umpires: any[];
}): JSX.Element => {
  const [showOtherUmpires, setShowOtherUmpires] = useState(false);

  const playerUmpire = user.player.umpire;

  const otherUmpires = umpires.filter(
    (umpire) => umpire.id !== playerUmpire.id
  );

  return (
    <Box>
      {playerUmpire && (
        <Box>
          <h2>Pelaajan tuomari</h2>
          <p>
            {playerUmpire.user.firstName} {playerUmpire.user.lastName} (
            {playerUmpire.responsibility})
          </p>
          <p>
            {playerUmpire.user.email} {playerUmpire.user.phone}
          </p>
        </Box>
      )}

      {otherUmpires.length !== 0 && (
        <div>
          <h3 style={{ display: "inline" }}>Muut tuomarit</h3>
          <Button
            onClick={() => setShowOtherUmpires(!showOtherUmpires)}
            sx={{ color: "white" }}
          >
            {showOtherUmpires ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
          </Button>
          {showOtherUmpires ? (
            <div>
              {otherUmpires.map((umpire) => (
                <div key={umpire.id}>
                  <p>
                    {umpire.user.firstName} {umpire.user.lastName} (
                    {umpire.responsibility})
                  </p>
                  <p>
                    {umpire.user.email} {umpire.user.phone}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <Box sx={{ mt: 4 }}>
        <h2>Yhteystiedot</h2>
        <p>puhelinnumero: {user.phone}</p>
        <p>email: {user.email}</p>

        {currentUserIsUmpire && (
          <>
            <h3>Käyttäjän viime käynti</h3>
            <p>20434390242</p>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PlayerInfo;
