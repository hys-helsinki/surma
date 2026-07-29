import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "../api/auth/[...nextauth]";
import CreateTournamentForm from "../../components/Admin/CreateTournamentForm";

const isCurrentUserAuthorized = async (context) => {
  const session = await getServerSession(context.req, context.res, authConfig);

  if (!session) return false;

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "ADMIN"
    }
  });
  return !!user;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(context))) {
    console.log("Unauthorized tournament creation view!");
    return { redirect: { destination: "/", permanent: false } };
  }
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"]))
    }
  };
};

export default function CreateTournamentPage() {
  return (
    <AuthenticationRequired>
      <CreateTournamentForm />
    </AuthenticationRequired>
  );
}
