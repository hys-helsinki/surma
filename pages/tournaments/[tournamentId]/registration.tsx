import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";
import UserForm from "../../../components/Registration/UserForm";
import TeamForm from "../../../components/Registration/TeamForm";
import { Tournament } from "@prisma/client";
import { unstable_getServerSession } from "next-auth/next";
import { authConfig } from "../../api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res
}) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  if (session) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        umpire: true,
        tournamentId: true
      }
    });
    if (user.umpire) {
      return {
        redirect: {
          destination: `/admin/${user.tournamentId}`,
          permanent: false
        }
      };
    }
    return {
      redirect: {
        destination: `/tournaments/${user.tournamentId}/users/${user.id}`,
        permanent: false
      }
    };
  }
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
