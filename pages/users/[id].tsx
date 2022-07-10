import pelaajat from '../../pelaajat.json'
import { GetStaticProps, GetStaticPaths } from 'next';
import { PlayerData } from '../../components/PlayerData';
import { PlayerContact } from '../../components/PlayerContact';

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const userData = pelaajat.find(p => p.id === params.id)
  return {
    props: {
      userData
    },
  };
}

export default function User({
  userData
}: {
  userData: {
    id: string
    firstName: string
    lastName: string
    alias: string
    phone: string
    email: string
    address: string
    learningInstitution: string
    description: {
      eyeColor: string
      hair: string
      height: number
      glasses: string
      other: string
    }
    calendar: object
  }
}
  ): JSX.Element {

  return (
    <div>
      <h1>{userData.firstName} {userData.lastName}</h1>
      <PlayerContact data={userData}/>
      <PlayerData data={userData}/>
    </div>
  )
}


export const getStaticPaths: GetStaticPaths = async () => {

  const paths = pelaajat.map(user => ({
    params : { id: user.id },
  }))
  return {
    paths,
    fallback: false
  }
}
