import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  let tournament = await prisma.tournament.findFirst({
    select: {
      name: true,
      start: true,
      end: true,
      players: true,
      umpires: true,
      rings: true,
      users: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament));
  console.log(tournament);
  return {
    props: { tournament }
  };
};

export default function Admin({ tournament }) {
  return (
    <div>
      <h2>Turnauksenhallintasivu</h2>
      <h3>{tournament.name}</h3>
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
  );
}
