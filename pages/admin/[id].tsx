import { Grid, Box } from "@mui/material";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/Admin/TournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";
import PlayerTable from "../../components/Admin/PlayerTable";
import Link from "next/link";

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
  return umpire != null;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(params.id, context))) {
    console.log("Unauthorized admin tournament view!");
    return { redirect: { destination: "/personal", permanent: false } };
  }
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.id as string
    }
  });

  let users = await prisma.user.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      player: true,
      umpire: true
    }
  });

  let players = await prisma.player.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      user: true
    }
  });

  let ringList = await prisma.assignmentRing.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      assignments: true
    }
  });

  // to avoid Next.js serialization error that is caused by Datetime objects
  tournament = JSON.parse(JSON.stringify(tournament));
  users = JSON.parse(JSON.stringify(users));
  players = JSON.parse(JSON.stringify(players));
  ringList = JSON.parse(JSON.stringify(ringList));

  return {
    props: { tournament, users, players, ringList }
  };
};

export default function Tournament({ tournament, users, players, ringList }) {
  const [rings, setRings] = useState<any[]>(ringList);

  const handleMakeWanted = async (id: string) => {
    const res = await fetch(`/api/player/${id}/wanted`, {
      method: "POST"
    });

    const createdRing = await res.json();
    setRings((prevRings) => prevRings.concat(createdRing));
  };

  const unfinishedRegistrations = users
    .filter((user) => !user.player && !user.umpire)
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  const finishedRegistrations = players.sort((a, b) =>
    a.user.firstName.localeCompare(b.user.firstName)
  );

  return (
    <AuthenticationRequired>
      <Box sx={{ m: 2 }}>
        <h2 style={{ width: "100%" }}>{tournament.name}</h2>
        <Grid container>
          <Grid item xs={12} md={6}>
            {unfinishedRegistrations.length > 0 && (
              <div style={{ paddingLeft: "10px", marginBottom: "30px" }}>
                <h3>Keskeneräiset ilmoittautumiset</h3>
                {unfinishedRegistrations.map((user) => (
                  <Link
                    href={`/tournaments/${tournament.id}/users/${user.id}`}
                    key={user.id}
                  >
                    <a>
                      {user.firstName} {user.lastName}
                    </a>
                  </Link>
                ))}
              </div>
            )}
            <PlayerTable
              playerList={finishedRegistrations}
              tournament={tournament}
              handleMakeWanted={handleMakeWanted}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TournamentRings
              tournament={tournament}
              players={finishedRegistrations}
              rings={rings}
            />
          </Grid>
        </Grid>
      </Box>
    </AuthenticationRequired>
  );
}
