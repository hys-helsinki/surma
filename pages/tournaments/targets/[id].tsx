import { Prisma, Player } from "@prisma/client";
import { GetStaticProps } from "next";
import { PlayerDetails } from "../../../components/PlayerDetails";
import prisma from "../../../lib/prisma";
import { AuthenticationRequired } from "../../../components/AuthenticationRequired";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const playerAsTarget: Prisma.PlayerSelect = {
    address: true,
    learningInstitution: true,
    eyeColor: true,
    hair: true,
    height: true,
    glasses: true,
    other: true,
    calendar: true,
    user: {
      select: {
        firstName: true,
        lastName: true
      }
    }
  };
  const player = await prisma.player.findUnique({
    where: {
      userId: params.id as string
    },
    select: playerAsTarget
  });
  return {
    props: player
  };
};

export default function Target(player): JSX.Element {
  return (
    <AuthenticationRequired>
      <div>
        <h1>
          {player.user.firstName} {player.user.lastName}
        </h1>
        <PlayerDetails player={player} />
      </div>
    </AuthenticationRequired>
  );
}

export async function getStaticPaths() {
  const targetIds = await prisma.player.findMany({ select: { id: true } });
  return {
    paths: targetIds.map((target) => ({
      params: target
    })),
    fallback: false
  };
}
