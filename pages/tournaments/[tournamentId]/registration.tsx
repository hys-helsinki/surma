import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";
import UserForm from "../../../components/Registration/UserForm";
import TeamForm from "../../../components/Registration/TeamForm";
import { Tournament } from "@prisma/client";
import { unstable_getServerSession } from "next-auth/next";
import { authConfig } from "../../api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../../components/Common/LoadingSpinner";

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res
}) => {
  const session = await unstable_getServerSession(req, res, authConfig);

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
    props: { tournament }
  };
};

export default function Registration({
  tournament
}: {
  tournament: Tournament;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  useEffect(() => {
    router.events.on("routeChangeStart", startLoading);
    router.events.on("routeChangeComplete", stopLoading);
    return () => {
      router.events.off("routeChangeStart", startLoading);
      router.events.off("routeChangeComplete", stopLoading);
    };
  }, [router]);

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
        <h3 style={{ margin: 10 }}>Ilmoittautuminen ei ole auki</h3>
      )}
    </div>
  );
}
