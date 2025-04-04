import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Button } from "@mui/material";
import { Player, User, Tournament } from "@prisma/client";

interface PlayerWithUser extends Player {
  user: User;
}

export const TournamentRings = ({
  tournament,
  players,
  rings
}: {
  tournament: Tournament;
  players: PlayerWithUser[];
  rings: any;
}): JSX.Element => {
  const [allRings, setRings] = useState(rings);
  const [newRing, setNewRing] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [shownRingId, setShownRingId] = useState("");
  const [newHunter, setNewHunter] = useState("");
  const [newTarget, setNewTarget] = useState("");

  useEffect(() => {
    setRings(rings);
  }, [rings]);

  const createRing = async (event) => {
    event.preventDefault();
    const readyRing = {
      assignments: Object.values(newRing),
      name: event.target.ringName.value,
      tournamentId: tournament.id
    };
    const res = await fetch("/api/tournament/rings", {
      method: "POST",
      body: JSON.stringify(readyRing)
    });
    const createdRing = await res.json();
    setShowForm(false);
    setRings(allRings.concat(createdRing));
  };

  const deleteRing = async (id) => {
    const res = await fetch("/api/tournament/rings", {
      method: "DELETE",
      body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
    });
    const deletedRing = await res.json();
    setRings(allRings.filter((ring) => ring.id !== deletedRing.id));
  };

  const handleRingChange = (id, event) => {
    const assignment = newRing.find((assignment) => assignment.hunterId === id);
    if (event.target.value === "--") {
      return; // to prevent throwing error when the user selects the placeholder value again
    }
    const playerId = event.target.value;

    if (assignment) {
      const changedAssignment = { ...assignment, targetId: playerId };
      setNewRing(
        newRing.map((a) => (a.hunterId !== id ? a : changedAssignment))
      );
    } else {
      setNewRing(newRing.concat({ hunterId: id, targetId: playerId }));
    }
  };

  const toggleForm = () => {
    if (showForm === true) {
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  };

  const toggleShowRing = (ringId) => {
    if (shownRingId == ringId) {
      setShownRingId("");
    } else {
      setShownRingId(ringId);
    }
  };

  const deleteAssignment = async (event, assignmentId, ring) => {
    event.preventDefault();

    fetch("/api/tournament/assignments", {
      method: "DELETE",
      body: assignmentId
    })
      .then((res) => res.json())
      .then((data) =>
        setRings(allRings.map((r) => (r.id !== ring ? r : data)))
      );
  };

  const addAssignment = async (event, ring) => {
    event.preventDefault();
    if (newHunter && newTarget) {
      const newAssignment = {
        ringId: ring,
        hunterId: newHunter,
        targetId: newTarget
      };

      fetch("/api/tournament/assignments", {
        method: "POST",
        body: JSON.stringify(newAssignment)
      })
        .then((res) => res.json())
        .then((data) =>
          setRings(allRings.map((r) => (r.id !== ring ? r : data)))
        );
    }
  };

  const getPlayerName = (playerId) => {
    const searchedPlayer = players.find((player) => playerId == player.id);

    return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
  };

  const sortedPlayers = players.sort((a, b) =>
    a.user.firstName.localeCompare(b.user.firstName)
  );

  return (
    <div>
      <h2>Ringit</h2>
      {allRings.map((ring) => (
        <div key={ring.id}>
          <Button
            onClick={() => toggleShowRing(ring.id)}
            startIcon={
              shownRingId == ring.id ? (
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
          {shownRingId == ring.id && (
            <div style={{ paddingLeft: "35px" }}>
              {ring.assignments.map((a) => (
                <div key={a.id}>
                  <p>Metsästäjä {getPlayerName(a.hunterId)}</p>
                  <p>Kohde {getPlayerName(a.targetId)}</p>
                  <button
                    onClick={(e) => deleteAssignment(e, a.id, ring.id)}
                    style={{}}
                  >
                    Poista toimeksianto
                  </button>
                </div>
              ))}

              <form onSubmit={(e) => addAssignment(e, ring.id)}>
                <label>
                  Metsästäjä
                  <select
                    name="assignments"
                    onChange={(e) => setNewHunter(e.target.value)}
                  >
                    <option>--</option>
                    {sortedPlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.user.firstName} {player.user.lastName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Kohde
                  <select
                    name="assignments"
                    onChange={(e) => setNewTarget(e.target.value)}
                  >
                    <option>--</option>
                    {sortedPlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.user.firstName} {player.user.lastName}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" style={{ width: "20%" }}>
                  Luo uusi toimeksianto
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
      <button onClick={toggleForm}>
        {!showForm ? "luo uusi rinki" : "peruuta"}
      </button>
      {showForm && (
        <form onSubmit={createRing} style={{ width: "40%" }}>
          <label>
            Ringin nimi: <input type="text" name="ringName" />
          </label>
          {players &&
            sortedPlayers.map((player) => (
              <div key={player.id}>
                <Assignment
                  players={sortedPlayers}
                  player={player}
                  handleRingChange={(e) => handleRingChange(player.id, e)}
                />
              </div>
            ))}
          <button type="submit">Luo rinki</button>
        </form>
      )}
    </div>
  );
};

export function Assignment({ players, player, handleRingChange }) {
  return (
    <>
      <p>
        {player.user.firstName} {player.user.lastName}
      </p>
      <label>
        Kohde
        <select name="assignments" onChange={handleRingChange}>
          <option>--</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.user.firstName} {player.user.lastName}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
