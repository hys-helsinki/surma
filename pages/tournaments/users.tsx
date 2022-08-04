import Link from "next/link";
import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const objects = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      player: {
        select: {
          alias: true
        }
      }
    }
  });

  return {
    props: {
      objects
    }
  };
};

export default function UserList({ objects }) {
  return (
    <>
      <h1>List of users</h1>
      <ul>
        {objects.map(
          (o: {
            id: string;
            firstName: string;
            lastName: string;
            player: {
              alias: string;
            };
          }) => {
            return (
              <li key={o.id}>
                <Link href={`/tournaments/users/${o.id}`}>
                  <a>
                    {o.firstName} {o.lastName} ({o.player.alias})
                  </a>
                </Link>
              </li>
            );
          }
        )}
      </ul>
    </>
  );
}
