import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";
import UserForm from "../../../components/Registration/UserForm";
import TeamForm from "../../../components/Registration/TeamForm";
import { Tournament } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.tournamentId as string
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament)); // to avoid Next.js serialization error

  return {
    props: { tournament }
  };
};

export default function Registration({
  tournament
}: {
  tournament: Tournament;
}) {
  // const isRegistrationOpen =
  //   new Date().getTime() >
  //     new Date(tournament.registrationStartTime).getTime() &&
  //   new Date().getTime() < new Date(tournament.registrationEndTime).getTime();
  const isRegistrationOpen = false;

  const isTeamTournament = false;

  return (
    <div>
      {isRegistrationOpen ? (
        isTeamTournament ? (
          <TeamForm tournament={tournament} />
        ) : (
          <UserForm tournament={tournament} />
        )
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </div>
  );
}
