import { GetServerSideProps } from "next";
import prisma from "../lib/prisma";
import { useRouter } from "next/router";
import Link from "next/link";
import { AuthenticationRequired } from "../components/AuthenticationRequired";

export const getServerSideProps: GetServerSideProps = async () => {
  let tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      registrationStartTime: true,
      registrationEndTime: true,
      players: true,
      umpires: true
    }
  });
  let newTournaments = [];
  tournaments.map((tournament) =>
    newTournaments.push({
      ...tournament,
      startTime: tournament.startTime.toString(),
      endTime: tournament.endTime.toString(),
      registrationStartTime: tournament.registrationStartTime.toString(),
      registrationEndTime: tournament.registrationEndTime.toString()
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
    const date = new Date(s);
    const formattedDate = `${date.getDate()}.${
      date.getMonth() + 1
    }.${date.getFullYear()} klo ${s.split(" ")[4]}`;
    return formattedDate;
  };
  return (
    <AuthenticationRequired>
      <div>
        <div>
          <button onClick={switchPage}>Lisää turnaus</button>
        </div>
        {newTournaments.map((tournament) => (
          <div key={tournament.id}>
            <Link href={`/admin/${tournament.id}/`}>
              <a>{tournament.name}</a>
            </Link>

            <p>Alkaa: {modifyDate(tournament.startTime)}</p>
            <p>Päättyy: {modifyDate(tournament.endTime)}</p>
            <p>
              Ilmoittautuminen: {modifyDate(tournament.registrationStartTime)} -
              {modifyDate(tournament.registrationEndTime)}
            </p>
          </div>
        ))}
      </div>
    </AuthenticationRequired>
  );
}
