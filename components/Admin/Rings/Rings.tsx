import { useState } from "react";
import {
  Grid,
  FormControlLabel,
  Radio,
  FormControl,
  RadioGroup
} from "@mui/material";
import PlayersWithTargets from "./PlayersWithTargets";
import { TournamentRings } from "./TournamentRings";
import { TeamTournamentRings } from "./TeamTournamentRings";

const Rings = ({
  players,
  setPlayers,
  playerRings,
  setPlayerRings,
  teamRings,
  setTeamRings,
  teams,
  tournament
}) => {
  const [view, setView] = useState("team");

  return (
    <Grid container>
      <Grid item xs={12} md={4} mr={2}>
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
        {tournament.teamGame && view == "team" ? (
          <TeamTournamentRings
            tournament={tournament}
            teamRings={teamRings}
            teams={teams}
            setTeamRings={setTeamRings}
            setPlayers={setPlayers}
            setPlayerRings={setPlayerRings}
          />
        ) : (
          <TournamentRings
            tournament={tournament}
            players={players}
            setPlayers={setPlayers}
            rings={playerRings}
            setRings={setPlayerRings}
          />
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        <PlayersWithTargets
          players={players}
          rings={playerRings}
          tournament={tournament}
        />
      </Grid>
    </Grid>
  );
};

export default Rings;
