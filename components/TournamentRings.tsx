import { useState } from "react";

export const TournamentRings = ({
  tournament,
  players,
  rings
}): JSX.Element => {
  const [allRings, setRings] = useState(rings);
  const [newRing, setNewRing] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRing, setShowRing] = useState("");

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

  const updateRing = async (ringId, event) => {
    event.preventDefault();
    const readyRing = {
      assignments: Object.values(newRing),
      ring: ringId
    };
    fetch("/api/tournament/rings", {
      method: "PUT",
      body: JSON.stringify(readyRing)
    });
    setShowRing("");
  };

  const getTargetName = (targetId) => {
    const searchedPlayer = players.find((player) => targetId == player.id);

    return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
  };

  return (
    <div>
      <h2>Ringit</h2>
      {allRings.map((ring) => (
        <div>
          <a key={ring.id} onClick={() => toggleShowRing(ring.id)}>
            {ring.name}
          </a>
          {!showRing ? (
            <div>Ei näy</div>
          ) : (
            <div>
              <form onSubmit={(e) => updateRing(ring.id, e)}>
                {ring.assignments.map((a) => (
                  <div key={a.id}>
                    <p>Metsästäjä {a.hunterId}</p>
                    <label>
                      Kohde
                      <select
                        name="assignments"
                        onChange={(e) => handleRingChange(a.hunterId, e)}
                      >
                        <option>{a.targetId}</option>
                        {players.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.user.firstName} {player.user.lastName}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
                <button type="submit">Tallenna muokkaukset</button>
              </form>
            </div>
          )}
        </div>
      ))}
      {players.map((player) => (
        <div key={player.id}>
          <h3>
            {player.user.firstName} {player.user.lastName}
          </h3>
          <p>Kohteet</p>
          {player.targets.map((target) => (
            <p key={target.id}>{getTargetName(target.targetId)}</p>
          ))}
        </div>
      ))}
      <button onClick={toggleForm}>
        {!showForm ? "luo uusi rinki" : "peruuta"}
      </button>
      {!showForm ? null : (
        <form onSubmit={createRing}>
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
