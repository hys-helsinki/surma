import { GetStaticProps, GetStaticPaths } from 'next';
import { Prisma, Player } from '@prisma/client'
import { PlayerDetails } from '../../components/PlayerDetails';
import { PlayerContactInfo } from '../../components/PlayerContactInfo';
import prisma from '../../lib/prisma'

export const getStaticProps: GetStaticProps = async ({params}) => {
  const userData = await prisma.player.findUnique({
    where: {
      id: params.id,
    },
  });
  return {
    props: userData,
  };
}

export default function User(
  userData : Player
  ): JSX.Element {
  return (
    <div>
      <h1>{userData.firstName} {userData.lastName}</h1>
      <PlayerContactInfo data={userData}/>
      <PlayerDetails data={userData}/>
    </div>
  )
}


export const getStaticPaths: GetStaticPaths = async () => {
  const playerIds = await prisma.player.findMany({ select: { id: true } });
  return {
    paths: playerIds.map((player) => ({
      params: player,
    })),
    fallback: false,
  };
}
