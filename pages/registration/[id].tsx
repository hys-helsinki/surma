import { GetStaticPaths, GetStaticProps } from "next";
import prisma from "../../lib/prisma";
import UserForm from "../../components/Registration/UserForm";
import { Tournament } from "@prisma/client";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.id as string
    },
  });
  tournament = JSON.parse(JSON.stringify(tournament)); // to avoid Next.js serialization error

  return {
    props: { tournament }
  };
};

export default function Registration({ tournament }: {tournament: Tournament}) {

  return (
    <div>
      {new Date().getTime() <
      new Date(tournament.registrationEndTime).getTime() ? (
        <UserForm tournament={tournament}/>
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tournamentIds = await prisma.tournament.findMany({
    select: { id: true }
  });
  return {
    paths: tournamentIds.map((tournament) => ({
      params: tournament
    })),
    fallback: false
  };
};