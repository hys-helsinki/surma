import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import prisma from "../../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  let allPlayers = await prisma.player.findMany({
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      id: true,
      targets: true,
      hunters: true,
      tournamentId: true
    }
  });

  let rings = await prisma.assignmentRing.findMany({
    select: {
      id: true,
      name: true,
      assignments: true
    }
  });
  allPlayers = JSON.parse(JSON.stringify(allPlayers));
  rings = JSON.parse(JSON.stringify(rings)); // avoid Next.js serialization error
  return {
    props: { allPlayers, rings }
  };
};

export default function Rings({ allPlayers, rings }) {
  const [allRings, setRings] = useState(rings);
  const [newRing, setNewRing] = useState([]);
  const router = useRouter();
  const players = allPlayers.filter(
    (player) => player.tournamentId === router.query.tournamentId
  );

  const createRing = async (event) => {
    event.preventDefault();
    const readyRing = {
      assignments: Object.values(newRing),
      name: event.target.ringName.value,
      tournament: router.query.tournamentId
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
    const x = players.find(
      (p) => p.user.firstName === names[0] && p.user.lastName === names[1]
    );
    if (!assignment) {
      setNewRing(newRing.concat({ hunterId: id, targetId: x.id }));
    } else {
      const changedAssignment = { ...assignment, targetId: x.id };
      setNewRing(
        newRing.map((a) => (a.hunterId !== id ? a : changedAssignment))
      );
    }
  };
  return (
    <div>
      <h2>Ringit</h2>
      <p>Rinkejä luotu: {allRings.length == 0 ? "0" : allRings.length}</p>
      <form onSubmit={createRing}>
        <label>
          Ringin nimi: <input type="text" name="ringName" />
        </label>

        {players.map((player) => (
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
    </div>
  );
}

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
