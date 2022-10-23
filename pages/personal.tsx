import { unstable_getServerSession } from "next-auth";
import { authConfig } from "./api/auth/[...nextauth]";
import prisma from "../lib/prisma";
import { AuthenticationRequired } from "../components/AuthenticationRequired";

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );
  const currentUser = await prisma.user.findUnique({
    select: {
      tournamentId: true
    },
    where: {
      id: session.user.id
    }
  });
  return {
    redirect: {
      destination: `/tournaments/${currentUser.tournamentId}/users/${session.user.id}`,
      permanent: false
    }
  };
}

export default function Personal(): JSX.Element {
  return <AuthenticationRequired></AuthenticationRequired>;
}
