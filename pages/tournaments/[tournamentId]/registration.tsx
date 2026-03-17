import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";
import UserForm from "../../../components/Registration/UserForm";
import TeamForm from "../../../components/Registration/TeamForm";
import { Tournament } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../../api/auth/[...nextauth]";
import LoadingSpinner from "../../../components/Common/LoadingSpinner";
import { useRouterLoading } from "../../../lib/hooks";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  const session = await getServerSession(context.req, context.res, authConfig);

  if (session) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        umpire: true,
        tournamentId: true
      }
    });
    if (user.umpire) {
      return {
        redirect: {
          destination: `/admin/${user.tournamentId}`,
          permanent: false
        }
      };
    }
    return {
      redirect: {
        destination: `/tournaments/${user.tournamentId}/users/${user.id}`,
        permanent: false
      }
    };
  }
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.tournamentId as string
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament)); // to avoid Next.js serialization error

  return {
    props: {
      tournament,
      ...(await serverSideTranslations(context.locale, ["common"]))
    }
  };
};

export default function Registration({
  tournament
}: {
  tournament: Tournament;
}) {
  const isLoading = useRouterLoading();
  const { t } = useTranslation("common");

  if (isLoading) return <LoadingSpinner />;

  const isRegistrationOpen =
    new Date().getTime() >
      new Date(tournament.registrationStartTime).getTime() &&
    new Date().getTime() < new Date(tournament.registrationEndTime).getTime();

  return (
    <div>
      {isRegistrationOpen ? (
        tournament.teamGame ? (
          <TeamForm tournament={tournament} />
        ) : (
          <UserForm tournament={tournament} />
        )
      ) : (
        <h3 style={{ margin: 10 }}>{t("registration.registrationNotOpen")}</h3>
      )}
    </div>
  );
}
