import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import prisma from "../../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const allPlayers = await prisma.player.findMany({
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
  const rings = await prisma.assignmentRing.findMany({
    select: {
      id: true,
      name: true,
      assignments: true
    }
  });
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

  useEffect(() => {
    console.log(newRing);
  }, [newRing]);

  const createRing = async (event) => {
    event.preventDefault();
    const readyRing = {
      assignments: newRing,
      name: event.target.ringName.value,
      tournament: router.query.tournamentId
    };
    console.log("bäkkäriin lähtevä data", readyRing);
    fetch("/api/tournament/rings", {
      method: "POST",
      body: JSON.stringify(readyRing)
    });
  };
  const handleRingChange = (id, event) => {
    const assignment = newRing.find((ring) => ring.hunter === id);
    const names = event.target.value.split(" ");
    const x = players.find(
      (p) => p.user.firstName === names[0] && p.user.lastName === names[1]
    );
    console.log(x);
    if (!assignment) {
      setNewRing(newRing.concat({ hunter: id, target: x.id }));
    } else {
      const changedAssignment = { ...assignment, target: x.id };
      setNewRing(newRing.map((a) => (a.hunter !== id ? a : changedAssignment)));
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
