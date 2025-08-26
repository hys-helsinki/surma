import { Box, Button } from "@mui/material";
import { useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const Umpires = ({
  player,
  umpires
}: {
  player;
  umpires: any[];
}): JSX.Element => {
  const [showOtherUmpires, setShowOtherUmpires] = useState(false);

  const playerUmpire = player.umpire;

  const otherUmpires = playerUmpire
    ? umpires.filter((umpire) => umpire.id !== playerUmpire.id)
    : umpires;

  return (
    <Box>
      {playerUmpire && (
        <Box>
          <h2>
            <u>Pelaajan tuomari</u>
          </h2>
          <strong>
            {playerUmpire.user.firstName} {playerUmpire.user.lastName} (
            {playerUmpire.responsibility})
          </strong>
          <p style={{ marginTop: "auto" }}>
            {playerUmpire.user.email} {playerUmpire.user.phone}
          </p>
        </Box>
      )}

      {otherUmpires.length !== 0 && (
        <div>
          <h3 style={{ display: "inline" }}>Turnauksen tuomarit</h3>
          <Button
            onClick={() => setShowOtherUmpires(!showOtherUmpires)}
            sx={{ color: "white" }}
          >
            {showOtherUmpires ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </Button>
          {showOtherUmpires ? (
            <ul>
              {otherUmpires.map((umpire) => (
                <li key={umpire.id}>
                  <strong>
                    {umpire.user.firstName} {umpire.user.lastName} (
                    {umpire.responsibility})
                  </strong>
                  <p style={{ marginTop: "auto" }}>
                    {umpire.user.email}, {umpire.user.phone}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </Box>
  );
};

export default Umpires;
