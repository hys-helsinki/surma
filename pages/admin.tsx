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
  let newTournaments = [];
  tournaments.map((tournament) =>
    newTournaments.push({
      ...tournament,
      start: tournament.start.toString(),
      end: tournament.end.toString(),
      registrationStart: tournament.registrationStart.toString(),
      registrationEnd: tournament.registrationEnd.toString()
    })
  );
  newTournaments = JSON.parse(JSON.stringify(newTournaments));
  return {
    props: { newTournaments }
  };
};

export default function Admin({ newTournaments }) {
  const router = useRouter();
  const switchPage = () => {
    router.push("/admin/create");
  };

  const modifyDate = (s) => {
    console.log(s);
    const date = new Date(s);
    const formattedDate = `${date.getDate()}.${
      date.getMonth() + 1
    }.${date.getFullYear()} klo ${s.split(" ")[4]}`;
    return formattedDate;
  };
  return (
    <div>
      <div>
        <button onClick={switchPage}>Lisää turnaus</button>
      </div>
      {newTournaments.map((tournament) => (
        <div key={tournament.id}>
          <p>{tournament.name}</p>
          <p>Alkaa: {modifyDate(tournament.start)}</p>
          <p>Päättyy: {modifyDate(tournament.end)}</p>
          <p>
            Ilmoittautuminen: {modifyDate(tournament.registrationStart)} -
            {modifyDate(tournament.registrationEnd)}
          </p>
        </div>
      ))}
    </div>
  );
}