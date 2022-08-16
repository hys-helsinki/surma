import { GetStaticProps } from "next";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  let tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      start: true,
      end: true,
      registrationStart: true,
      registrationEnd: true,
      players: true,
      umpires: true
    }
  });
  tournaments = JSON.parse(JSON.stringify(tournaments)); // avoid Next.js serialization error
  return {
    props: { tournaments }
  };
};

export default function Admin({ tournaments }) {
  return (
    <div>
      {tournaments.map((tournament) => (
        <div key={tournament.id}>
          <p>{tournament.name}</p>
          <p>Alkaa: {tournament.start}</p>
          <p>Päättyy: {tournament.end}</p>
          <p>
            Ilmoittautuminen: {tournament.registrationStart}-
            {tournament.registrationEnd}
          </p>
        </div>
      ))}
    </div>
  );
}
