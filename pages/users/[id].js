import pelaajat from '../../pelaajat.json'

export async function getStaticProps({ params }) {
  const userData = pelaajat.find(p => p.id === params.id)
  return {
    props: {
      userData
    },
  };
}

export default function User({userData}) {

  return (
    <div>
      <h1>{userData.firstName} {userData.lastName}</h1>
      <h2>alias: {userData.alias}</h2>
    </div>
  )
}


export async function getStaticPaths() {

  const paths = pelaajat.map(user => ({
    params : { id: user.id },
  }))
  return {
    paths,
    fallback: false
  }
}
