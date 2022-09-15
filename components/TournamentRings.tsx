import { useState } from "react";

export const TournamentRings = ({
  tournament,
  players,
  rings
}): JSX.Element => {
  const [allRings, setRings] = useState(rings);
  const [newRing, setNewRing] = useState([]);
  const [showForm, setShowForm] = useState(false);

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

  const getTargetName = (targetId) => {
    const searchedPlayer = players.find((player) => targetId == player.id);

    return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
  };

  return (
    <div>
      <h2>Ringit</h2>
      <p>Rinkejä luotu: {!allRings ? "0" : allRings.length}</p>
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