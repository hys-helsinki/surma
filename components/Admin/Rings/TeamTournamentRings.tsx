import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Button } from "@mui/material";
import { Tournament, Team, TeamAssignment } from "@prisma/client";

const Ring = ({ ring, rings, setRings, teams, tournament }) => {
  const [showRing, setShowRing] = useState(false);
  const [assignments, setAssignments] = useState(ring.assignments);
  const [newHunter, setNewHunter] = useState("");
  const [newTarget, setNewTarget] = useState("");

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

  const deleteAssignment = async (id) => {
    const res = await fetch("/api/team-assignments/delete", {
      method: "DELETE",
      body: id
    });
    const ringWithoutDeletedAssigment = await res.json();
    setRings(
      rings.map((r) => (r.id !== ring ? r : ringWithoutDeletedAssigment))
    );
    setAssignments(assignments.filter((assignment) => assignment.id !== id));
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    if (newHunter && newTarget) {
      const newAssignment = {
        teamAssignmentRingId: ring.id,
        huntingTeamId: newHunter,
        targetTeamId: newTarget
      };

      const res = await fetch("/api/team-assignments/create", {
        method: "POST",
        body: JSON.stringify(newAssignment)
      });
      const createdAssignment = await res.json();
      setAssignments(assignments.concat(createdAssignment));
    }
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
          {assignments.map((a: TeamAssignment) => (
            <div key={a.id}>
              <p>
                <strong>Metsästäjä:</strong> {getTeamName(a.huntingTeamId)}
              </p>
              <p>
                <strong>Kohde:</strong> {getTeamName(a.targetTeamId)}
              </p>
              <button onClick={() => deleteAssignment(a.id)}>
                Poista toimeksianto
              </button>
              <p>---------</p>
            </div>
          ))}
          <form onSubmit={createAssignment}>
            <div>
              <label>
                <strong>Metsästäjä:</strong>
                <select
                  name="assignments"
                  onChange={(e) => setNewHunter(e.target.value)}
                >
                  <option value={""}>--</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamName(team.id)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                Kohde
                <select
                  name="assignments"
                  onChange={(e) => setNewTarget(e.target.value)}
                >
                  <option value={""}>--</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamName(team.id)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" style={{ width: "30%" }}>
              Luo uusi toimeksianto
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export const TeamTournamentRings = ({
  tournament,
  rings,
  teams,
  setRings
}: {
  tournament: Tournament;
  rings: any[];
  teams: Team[];
  setRings;
}): JSX.Element => {
  const [newRing, setNewRing] = useState([]);
  const [showForm, setShowForm] = useState(false);

  if (!teams) return;

  const createRing = async (event) => {
    event.preventDefault();
    const readyRing = {
      assignments: Object.values(newRing),
      name: event.target.ringName.value,
      tournamentId: tournament.id
    };

    if (
      readyRing.assignments.length == 0 ||
      readyRing.assignments.map((a) => a.targetTeamId).includes("")
    ) {
      return;
    }

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
            <div key={team.id}>
              <p>{team.name}</p>
              <label>
                Kohde
                <select
                  name="assignments"
                  onChange={(e) => handleRingChange(team.id, e)}
                >
                  <option value={""}>--</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
          <button type="submit">Luo rinki</button>
        </form>
      )}
    </div>
  );
};
