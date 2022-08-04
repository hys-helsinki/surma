import { GetStaticProps, GetStaticPaths } from "next";
import { Prisma } from "@prisma/client";
import { PlayerDetails } from "../../../components/PlayerDetails";
import { PlayerContactInfo } from "../../../components/PlayerContactInfo";
import prisma from "../../../lib/prisma";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: params.id
    },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      player: {
        select: {
          alias: true,
          address: true,
          learningInstitution: true,
          eyeColor: true,
          hair: true,
          height: true,
          glasses: true,
          other: true,
          calendar: true
        }
      }
    }
  });
  return {
    props: userData
  };
};

type UserWithPlayer = Prisma.UserGetPayload<{
  include: {
    player: true;
  };
}>;

export default function UserInfo(user: UserWithPlayer): JSX.Element {
  return (
    <div>
      <h1>
        {user.firstName} {user.lastName}
      </h1>
      <PlayerContactInfo user={user} />
      <PlayerDetails player={user.player} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const userIds = await prisma.user.findMany({ select: { id: true } });
  return {
    paths: userIds.map((player) => ({
      params: player
    })),
    fallback: false
  };
};
