import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Button } from "@mui/material";
import {
  Player,
  User,
  Tournament,
  Team,
  Assignment,
  TeamAssignment
} from "@prisma/client";

interface PlayerWithUser extends Player {
  user: User;
}

const NewAssignment = ({ teams, team, handleRingChange }) => {
  return (
    <div>
      <p>{team.name}</p>
      <label>
        Kohde
        <select name="assignments" onChange={handleRingChange}>
          <option>--</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

const Ring = ({ ring, rings, setRings, teams, tournament }) => {
  const [showRing, setShowRing] = useState(false);

  const getTeamName = (teamId: string) => {
    return teams.find((team) => teamId == team.id).name;
  };

  const deleteRing = async (id) => {
    const res = await fetch(`/api/team-rings/delete`, {
      method: "DELETE",
      body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
    });
    const deletedRing = await res.json();
    setRings(rings.filter((ring) => ring.id !== deletedRing.id));
  };

  return (
    <div key={ring.id}>
      <Button
        onClick={() => setShowRing(!showRing)}
        startIcon={
          showRing ? (
            <KeyboardArrowDownRoundedIcon />
          ) : (
            <KeyboardArrowRightRoundedIcon />
          )
        }
        sx={{
          fontFamily: "inherit",
          fontSize: "inherit",
          color: "inherit"
        }}
      >
        {ring.name}
      </Button>
      <IconButton onClick={() => deleteRing(ring.id)}>
        <DeleteOutlineIcon htmlColor="#FFFFFF" />
      </IconButton>
      {showRing && (
        <div style={{ paddingLeft: "35px" }}>
          {ring.assignments.map((a: TeamAssignment) => (
            <div key={a.id}>
              <p>
                <strong>Metsästäjä:</strong> {getTeamName(a.huntingTeamId)}
              </p>
              <p>
                <strong>Kohde:</strong> {getTeamName(a.targetTeamId)}
              </p>
              <p>---------</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TeamTournamentRings = ({
  tournament,
  players,
  rings,
  teams,
  setRings
}: {
  tournament: Tournament;
  players: PlayerWithUser[];
  rings: any;
  teams: Team[];
  setRings;
}): JSX.Element => {
  const [newRing, setNewRing] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [shownRingId, setShownRingId] = useState("");
  const [newHunter, setNewHunter] = useState("");
  const [newTarget, setNewTarget] = useState("");

  if (!teams) return;

  const createRing = async (event) => {
    event.preventDefault();
    const readyRing = {
      assignments: Object.values(newRing),
      name: event.target.ringName.value,
      tournamentId: tournament.id
    };

    const res = await fetch("/api/team-rings/create", {
      method: "POST",
      body: JSON.stringify(readyRing)
    });
    const createdRing = await res.json();
    setShowForm(false);
    setRings(rings.concat(createdRing));
    setNewRing([]);
  };

  const handleRingChange = (id, event) => {
    const assignment = newRing.find(
      (assignment) => assignment.huntingTeamId === id
    );
    if (event.target.value === "--") {
      return; // to prevent throwing error when the user selects the placeholder value again
    }
    const teamId = event.target.value;

    if (!assignment) {
      setNewRing(newRing.concat({ huntingTeamId: id, targetTeamId: teamId }));
    } else {
      const changedAssignment = { ...assignment, targetTeamId: teamId };
      setNewRing(
        newRing.map((a) => (a.huntingTeamId !== id ? a : changedAssignment))
      );
    }
  };

  const toggleShowRing = (ringId) => {
    if (shownRingId == ringId) {
      setShownRingId("");
    } else {
      setShownRingId(ringId);
    }
  };
  return (
    <div>
      <h2>Ringit</h2>
      {rings.map((ring) => (
        <Ring
          key={ring.id}
          ring={ring}
          rings={rings}
          setRings={setRings}
          teams={teams}
          tournament={tournament}
        />
      ))}
      <button onClick={() => setShowForm(!showForm)}>
        {!showForm ? "luo uusi rinki" : "peruuta"}
      </button>
      {!showForm ? null : (
        <form onSubmit={createRing} style={{ width: "40%" }}>
          <label>
            Ringin nimi: <input type="text" name="ringName" />
          </label>
          {teams.map((team) => (
            <NewAssignment
              teams={teams}
              team={team}
              handleRingChange={(e) => handleRingChange(team.id, e)}
              key={team.id}
            />
          ))}
          <button type="submit">Luo rinki</button>
        </form>
      )}
    </div>
  );
};
