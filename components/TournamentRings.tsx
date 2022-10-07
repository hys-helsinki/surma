import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";

export const TournamentRings = ({
  tournament,
  players,
  rings
}): JSX.Element => {
  const [allRings, setRings] = useState(rings);
  const [newRing, setNewRing] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRing, setShowRing] = useState("");
  const [newHunter, setNewHunter] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const createRing = async (event) => {
    event.preventDefault();
    const readyRing = {
      assignments: Object.values(newRing),
      name: event.target.ringName.value,
      tournament: tournament.id
    };
    fetch("/api/tournament/rings", {
      method: "POST",
      body: JSON.stringify(readyRing)
    });
    setShowForm(false);
    setRings(rings.concat(readyRing));
  };
  const handleRingChange = (id, event) => {
    const assignment = newRing.find((assignment) => assignment.hunterId === id);
    if (event.target.value === "--") {
      return; // to prevent throwing error when the user selects the placeholder value again
    }
    const playerId = event.target.value;

    if (!assignment) {
      setNewRing(newRing.concat({ hunterId: id, targetId: playerId }));
    } else {
      const changedAssignment = { ...assignment, targetId: playerId };
      setNewRing(
        newRing.map((a) => (a.hunterId !== id ? a : changedAssignment))
      );
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
    if (showRing == ringId) {
      setShowRing("");
    } else {
      setShowRing(ringId);
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
      console.log("ok");
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

  const getPlayerName = (targetId) => {
    const searchedPlayer = players.find((player) => targetId == player.id);

    return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Ringit</h2>
      {allRings.map((ring) => (
        <div key={ring.id}>
          <a
            onClick={() => toggleShowRing(ring.id)}
            style={{ marginTop: "5px" }}
          >
            {showRing == ring.id ? (
              <KeyboardArrowDownRoundedIcon />
            ) : (
              <KeyboardArrowRightRoundedIcon />
            )}
            {ring.name}
          </a>
          {showRing != ring.id ? (
            <div></div>
          ) : (
            <div>
              {ring.assignments.map((a) => (
                <div key={a.id}>
                  <p>Metsästäjä {getPlayerName(a.hunterId)}</p>
                  <p>Kohde {getPlayerName(a.targetId)}</p>
                  <IconButton
                    onClick={(e) => deleteAssignment(e, a.id, ring.id)}
                  >
                    <DeleteOutlineIcon htmlColor="#eceff1" />
                  </IconButton>
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
                    {players.map((player) => (
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
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.user.firstName} {player.user.lastName}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" style={{ width: "15%" }}>
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
      {!showForm ? null : (
        <form onSubmit={createRing} style={{ width: "40%" }}>
          <label>
            Ringin nimi: <input type="text" name="ringName" />
          </label>
          {!players
            ? null
            : players.map((player) => (
                <div key={player.id}>
                  <Assignment
                    players={players}
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
