import pelaajat from "../../pelaajat.json";
import prisma from "../../lib/prisma";

export async function getStaticProps({ params }) {
  const userData = await prisma.player.findUnique({
    where: {
      id: params.id,
    },
  });
  return {
    props: {
      ...userData,
      description: {},
      calendar: [],
    },
  };
}

export default function User(userData) {
  const cal = [];
  for (const x in userData.calendar) {
    cal.push([x, userData.calendar[x]]);
  }
  return (
    <div>
      <h1>
        {userData.firstName} {userData.lastName}
      </h1>
      <h2>alias: {userData.alias}</h2>
      <p>puhelinnumero: {userData.phone}</p>
      <p>email: {userData.email}</p>
      <p>osoite: {userData.address}</p>
      <p>opinahjo: {userData.learningInstitution}</p>
      <h3>Kuvaus</h3>
      <p>silmät: {userData.description.eyeColor}</p>
      <p>hiukset: {userData.description.hair}</p>
      <p>pituus: {userData.description.height}</p>
      <p>silmälasit: {userData.description.glasses}</p>
      <p>muu: {userData.description.other}</p>
      <h3>Kalenteri</h3>
      <ul>
        {cal.map((c, index) => (
          <li key={index}>
            {c[0]}: {c[1]}
          </li>
        ))}
      </ul>
    </div>
  );
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
