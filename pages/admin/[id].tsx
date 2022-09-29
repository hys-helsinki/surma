import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/TournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  return umpire != null;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(params.id, context))) {
    console.log("Unauthorized admin tournament view!");
    return { redirect: { destination: "/personal", permanent: false } };
  }
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.id as string
    }
  });
  let players = await prisma.player.findMany({
    where: {
      tournamentId: params.id as string
    },
    select: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      id: true,
      targets: true,
      hunters: true
    }
  });
  let rings = await prisma.assignmentRing.findMany({
    where: {
      tournamentId: params.id as string
    },
    select: {
      id: true,
      name: true,
      assignments: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament));
  players = JSON.parse(JSON.stringify(players));
  rings = JSON.parse(JSON.stringify(rings));
  return {
    props: { tournament, players, rings }
  };
};

export default function Tournament({ tournament, players, rings }) {
  return (
    <AuthenticationRequired>
      <div>
        <h2>{tournament.name}</h2>
        <TournamentRings
          tournament={tournament}
          players={players}
          rings={rings}
        />
      </div>
    </AuthenticationRequired>
  );
}
