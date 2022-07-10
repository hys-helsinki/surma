import Link from "next/link";
import prisma from "../lib/prisma";

export async function getStaticProps() {
  const objects = await prisma.player.findMany();

  return {
    props: {
      objects,
    },
  };
}

export default function UserList({ objects }) {
  return (
    <>
      <h1>List of users</h1>
      <ul>
        {objects.map((o) => (
          <li key={o.id}>
            <Link href={`/users/${o.id}`}>
              <a>
                {o.firstName} {o.lastName} ({o.alias}) {o.id}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
