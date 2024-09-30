import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import UserForm from "../../components/Registration/UserForm";
import { Tournament } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.id as string
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
  const isRegistrationOpen =
    new Date().getTime() >
      new Date(tournament.registrationStartTime).getTime() &&
    new Date().getTime() < new Date(tournament.registrationEndTime).getTime();

  return (
    <div>
      {isRegistrationOpen ? (
        <UserForm tournament={tournament} />
      ) : (
        <p>Ilmoittautuminen ei ole auki</p>
      )}
    </div>
  );
}
