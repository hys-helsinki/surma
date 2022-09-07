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
  };
  const handleRingChange = (id, event) => {
    const assignment = newRing.find((assignment) => assignment.hunterId === id);
    if (event.target.value === "--") {
      return; // to prevent throwing error when the user selects the placeholder value again
    }
    const names = event.target.value.split(" ");
    const wantedPlayer = players.find(
      (p) => p.user.firstName === names[0] && p.user.lastName === names[1]
    );
    if (!assignment) {
      setNewRing(newRing.concat({ hunterId: id, targetId: wantedPlayer.id }));
    } else {
      const changedAssignment = { ...assignment, targetId: wantedPlayer.id };
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
  return (
    <div>
      <h2>Ringit</h2>
      <p>Rinkejä luotu: {!allRings ? "0" : allRings.length}</p>
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
            <option key={player.id}>
              {player.user.firstName} {player.user.lastName}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
