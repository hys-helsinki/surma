import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import { useRouter } from "next/router";

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
  const router = useRouter();
  const switchPage = () => {
    router.push("/admin/create");
  };
  return (
    <div>
      <div>
        <button onClick={switchPage}>Lisää turnaus</button>
      </div>
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
