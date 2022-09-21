import Link from "next/link";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";

export const getServerSideProps: GetServerSideProps = async () => {
  const objects = await prisma.player.findMany({
    select: {
      id: true,
      alias: true,
      user: {
        select: { firstName: true, lastName: true }
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
    <AuthenticationRequired>
      <h1>List of players</h1>
      <ul>
        {objects.map(
          (o: {
            id: string;
            alias: string;
            user: {
              firstName: string;
              lastName: string;
            };
          }) => {
            return (
              <li key={o.id}>
                <Link href={`/tournaments/users/${o.id}`}>
                  <a>
                    {o.user.firstName} {o.user.lastName} ({o.alias})
                  </a>
                </Link>
              </li>
            );
          }
        )}
      </ul>
    </AuthenticationRequired>
  );
}
