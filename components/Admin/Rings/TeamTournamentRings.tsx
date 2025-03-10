import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Button } from "@mui/material";
import { Tournament, Team, TeamAssignment } from "@prisma/client";
import { LoadingButton } from "@mui/lab";

const Ring = ({ ring, rings, setRings, teams, tournament }) => {
  const [showRing, setShowRing] = useState(false);
  const [assignments, setAssignments] = useState(ring.assignments);
  const [newHunter, setNewHunter] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [isDeletingRing, setIsDeletingRing] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

  const getTeamName = (teamId: string) => {
    return teams.find((team) => teamId == team.id).name;
  };

  const deleteRing = async (id) => {
    setIsDeletingRing(true);
    const res = await fetch(`/api/team-rings/delete`, {
      method: "DELETE",
      body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
    });
    const deletedRing = await res.json();
    setRings(rings.filter((ring) => ring.id !== deletedRing.id));
    setIsDeletingRing(false);
  };

  const deleteAssignment = async (id) => {
    setIsDeletingAssignment(true);
    const res = await fetch("/api/team-assignments/delete", {
      method: "DELETE",
      body: id
    });
    const ringWithoutDeletedAssigment = await res.json();
    setRings(
      rings.map((r) => (r.id !== ring ? r : ringWithoutDeletedAssigment))
    );
    setAssignments(assignments.filter((assignment) => assignment.id !== id));
    setIsDeletingAssignment(false);
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    if (newHunter && newTarget) {
      setIsCreatingAssignment(true);
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
      setIsCreatingAssignment(false);
      setNewHunter("");
      setNewTarget("");
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
        <DeleteOutlineIcon
          htmlColor="#FFFFFF"
          color={isDeletingRing ? "disabled" : "inherit"}
        />
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
              <LoadingButton
                onClick={() => deleteAssignment(a.id)}
                loading={isDeletingAssignment}
                sx={{
                  fontFamily: "tahoma",
                  fontWeight: "bold",
                  textTransform: "none",
                  letterSpacing: "normal"
                }}
              >
                Poista toimeksianto
              </LoadingButton>
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
            <LoadingButton
              type="submit"
              sx={{
                fontFamily: "tahoma",
                fontWeight: "bold",
                textTransform: "none",
                letterSpacing: "normal"
              }}
              loading={isCreatingAssignment}
            >
              Luo uusi toimeksianto
            </LoadingButton>
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
  const [isCreatingRing, setIsCreatingRing] = useState(false);

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

    setIsCreatingRing(true);

    const res = await fetch("/api/team-rings/create", {
      method: "POST",
      body: JSON.stringify(readyRing)
    });
    const createdRing = await res.json();
    setShowForm(false);
    setRings(rings.concat(createdRing));
    setNewRing([]);
    setIsCreatingRing(false);
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
        <form onSubmit={createRing} style={{ width: "100%" }}>
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
          <LoadingButton
            type="submit"
            loading={isCreatingRing}
            sx={{
              fontFamily: "tahoma",
              fontWeight: "bold",
              textTransform: "none",
              letterSpacing: "normal"
            }}
          >
            Luo rinki
          </LoadingButton>
        </form>
      )}
    </div>
  );
};
