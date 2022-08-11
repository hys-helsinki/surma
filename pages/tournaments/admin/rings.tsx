import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import prisma from "../../../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const players = await prisma.player.findMany({
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      id: true,
      targets: true,
      hunters: true
    }
  });
  const rings = await prisma.assignmentRing.findMany({
    select: {
      id: true,
      name: true,
      assignments: true
    }
  });
  return {
    props: { players, rings }
  };
};

export default function Rings({ players, rings }) {
  const [allRings, setRings] = useState(rings);
  const [newRing, setNewRing] = useState([]);

  useEffect(() => {
    console.log(newRing);
  }, [newRing]);

  const createRing = async (event) => {
    event.preventDefault();
    console.log("valmis rinki", newRing);
  };
  const handleRingChange = (id, event) => {
    const assignment = newRing.find((ring) => ring.hunter === id);
    if (!assignment) {
      setNewRing(newRing.concat({ hunter: id, target: event.target.value }));
    } else {
      const changedAssignment = { ...assignment, target: event.target.value };
      setNewRing(newRing.map((a) => (a.hunter !== id ? a : changedAssignment)));
    }
  };
  return (
    <div>
      <h2>Ringit</h2>
      <p>Rinkejä luotu: {allRings.length == 0 ? "0" : allRings.length}</p>
      <form onSubmit={createRing}>
        {players.map((player) => (
          <div key={player.id}>
            <Ring
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

export function Ring({ players, player, handleRingChange }) {
  return (
    <>
      <p>
        {player.user.firstName} {player.user.lastName}
      </p>
      <label>
        Kohde
        <select name="assignments" onChange={handleRingChange}>
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
