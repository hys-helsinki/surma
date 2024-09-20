import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";

export const TournamentRings = ({ tournament, users, rings }): JSX.Element => {
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
      tournament: tournament.id
    };
    fetch("/api/tournament/rings", {
      method: "POST",
      body: JSON.stringify(readyRing)
    });
    setShowForm(false);
    setRings(rings.concat(readyRing));
  };

  const deleteRing = async (id) => {
    fetch("/api/tournament/rings", {
      method: "DELETE",
      body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
    });
    setRings(allRings.filter((ring) => ring.id !== id));
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

  const getPlayerName = (targetId) => {
    const searchedUser = users.find((user) => targetId == user.player.id);

    return `${searchedUser.firstName} ${searchedUser.lastName}`;
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
            {shownRingId == ring.id ? (
              <KeyboardArrowDownRoundedIcon />
            ) : (
              <KeyboardArrowRightRoundedIcon />
            )}
            {ring.name}
          </a>
          {shownRingId == ring.id && (
            <div>
              <button onClick={() => deleteRing(ring.id)}>Poista</button>
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
                    {users.map((user) => (
                      <option key={user.player.id} value={user.player.id}>
                        {user.firstName} {user.lastName}
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
                    {users.map((user) => (
                      <option key={user.player.id} value={user.player.id}>
                        {user.firstName} {user.lastName}
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
          {users &&
            users.map((user) => (
              <div key={user.player.id}>
                <Assignment
                  users={users}
                  user={user}
                  handleRingChange={(e) => handleRingChange(user.player.id, e)}
                />
              </div>
            ))}
          <button type="submit">Luo rinki</button>
        </form>
      )}
    </div>
  );
};

export function Assignment({ users, user, handleRingChange }) {
  return (
    <>
      <p>
        {user.firstName} {user.lastName}
      </p>
      <label>
        Kohde
        <select name="assignments" onChange={handleRingChange}>
          <option>--</option>
          {users.map((user) => (
            <option key={user.player.id} value={user.player.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
