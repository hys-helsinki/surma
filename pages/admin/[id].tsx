import { GetStaticPaths, GetStaticProps } from "next";
import { TournamentRings } from "../../components/TournamentRings";
import prisma from "../../lib/prisma";

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
    <div>
      <h2>{tournament.name}</h2>
      <TournamentRings
        tournament={tournament}
        players={players}
        rings={rings}
      />
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
