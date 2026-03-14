import { useState } from "react";
import {
  Grid,
  FormControlLabel,
  Radio,
  FormControl,
  RadioGroup
} from "@mui/material";
import PlayersWithTargets from "./PlayersWithTargets";
import { PlayerRings } from "./PlayerRings";
import { TeamRings } from "./TeamRings";
import { RingComponentProps } from "../../../types/umpirepage";

const Rings = ({
  players,
  setPlayers,
  playerRings,
  setPlayerRings,
  teamRings,
  setTeamRings,
  teams,
  tournament
}: RingComponentProps) => {
  const [view, setView] = useState("team");

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 4 }} mr={2}>
        <h2>Ringit</h2>
        {tournament.teamGame && (
          <FormControl>
            <RadioGroup
              value={view}
              onChange={(e) => setView(e.target.value)}
              row
            >
              <FormControlLabel
                value="team"
                control={
                  <Radio
                    sx={{
                      color: "white",
                      "&.Mui-checked": {
                        color: "red"
                      }
                    }}
                  />
                }
                label="Joukkuenäkymä"
              />
              <FormControlLabel
                value="player"
                control={
                  <Radio
                    color="secondary"
                    sx={{
                      color: "white",
                      "&.Mui-checked": {
                        color: "red"
                      }
                    }}
                  />
                }
                label="Pelaajanäkymä"
              />
            </RadioGroup>
          </FormControl>
        )}
        {tournament.teamGame && view === "team" ? (
          <TeamRings
            tournament={tournament}
            teamRings={teamRings}
            teams={teams}
            setTeamRings={setTeamRings}
            setPlayers={setPlayers}
            setPlayerRings={setPlayerRings}
          />
        ) : (
          <PlayerRings
            tournament={tournament}
            players={players}
            setPlayers={setPlayers}
            playerRings={playerRings}
            setPlayerRings={setPlayerRings}
          />
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <PlayersWithTargets
          players={players}
          playerRings={playerRings}
          tournament={tournament}
        />
      </Grid>
    </Grid>
  );
};

export default Rings;
