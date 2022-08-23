import { GetStaticProps } from "next";
import Link from "next/link";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  let tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      start: true,
      end: true,
      players: true,
      umpires: true,
      rings: true,
      users: true
    }
  });
  tournaments = JSON.parse(JSON.stringify(tournaments));
  return {
    props: { tournaments }
  };
};

export default function Admin({ tournaments }) {
  return (
    <div>
      <h2>Turnauksenhallintasivu</h2>
      {tournaments.map((tournament) => (
        <div key={tournament.id}>
          <h3>{tournament.name}</h3>
          <Link href={`/admin/rings?tournamentId=${tournament.id}`}>
            Ringit
          </Link>
          <p>Alkaa: {tournament.start.split("T")[0]}</p>
          <p>Päättyy: {tournament.end.split("T")[0]}</p>
          <div>
            <h3>Pelaajat</h3>
            {tournament.users.map((user) => (
              <p key={user.id}>
                {user.firstName} {user.lastName}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
