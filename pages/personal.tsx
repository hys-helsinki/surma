import { getServerSession } from "next-auth";
import { authConfig } from "./api/auth/[...nextauth]";
import { AuthenticationRequired } from "../components/AuthenticationRequired";
import { JSX } from "react";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authConfig);
  return {
    redirect: {
      destination: `/tournaments/${session.user.tournamentId}/users/${session.user.id}`,
      permanent: false
    }
  };
}

export default function Personal(): JSX.Element {
  return <AuthenticationRequired></AuthenticationRequired>;
}
