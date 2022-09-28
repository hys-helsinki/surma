import Link from "next/link";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";
import { AuthenticationRequired } from "../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../api/auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  console.log("access check for tournament", tournamentId);
  console.log("checking current user umpire status:", umpire);
  return umpire != null;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(params.tournamentId, context))) {
    console.log("is not authorized!");
    return { redirect: { destination: "/personal", permanent: false } };
  }
  const objects = await prisma.player.findMany({
    select: {
      id: true,
      alias: true,
      user: {
        select: { firstName: true, lastName: true }
      }
    },
    where: {
      tournamentId: params.tournamentId as string
    }
  });

  return {
    props: {
      objects
    }
  };
};

export default function PlayerList({ objects }) {
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
