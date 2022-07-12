import { Prisma, Player } from '@prisma/client'
import { GetStaticProps } from 'next'
<<<<<<< HEAD
import { PlayerDetails } from '../../../components/PlayerDetails'
import prisma from '../../../lib/prisma'
=======
import { PlayerData } from '../../../components/PlayerData'
>>>>>>> d8d83b4 (more refactoring)

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const playerAsTarget: Prisma.PlayerSelect = {
    firstName: true,
    lastName: true,
    address: true,
    learningInstitution: true,
    eyeColor: true,
    hair: true,
    height: true,
    glasses: true,
    other: true,
    calendar: true
  };
  const userData = await prisma.player.findUnique({
    where: {
      id: params.id,
    },
    select: playerAsTarget
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
<<<<<<< HEAD
      <PlayerDetails data={userData}/>
=======
      <PlayerData data={userData}/>
>>>>>>> d8d83b4 (more refactoring)
    </div>
  )
}


export async function getStaticPaths() {
  const playerIds = await prisma.player.findMany({ select: { id: true } });
  return {
    paths: playerIds.map((player) => ({
      params: player,
    })),
    fallback: false,
  };
}
