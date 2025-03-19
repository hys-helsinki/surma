import { Grid, Box } from "@mui/material";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/Admin/Rings/TournamentRings";
import { TeamTournamentRings } from "../../components/Admin/Rings/TeamTournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";
import PlayerTable from "../../components/Admin/PlayerTable";
import Link from "next/link";
import { Field, Form, Formik } from "formik";

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
      user: true,
      umpire: {
        include: {
          user: true
        }
      }
    }
  });

  const rings = await prisma.assignmentRing.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      assignments: true
    }
  });

  const teamRings = await prisma.teamAssignmentRing.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      assignments: true
    }
  });

  let teams = await prisma.team.findMany({
    where: {
      tournamentId: params.id as string
    }
  });

  // to avoid Next.js serialization error that is caused by Datetime objects
  tournament = JSON.parse(JSON.stringify(tournament));
  users = JSON.parse(JSON.stringify(users));
  players = JSON.parse(JSON.stringify(players));
  teams = JSON.parse(JSON.stringify(teams));
  let ringList = tournament.teamGame ? teamRings : rings;
  ringList = JSON.parse(JSON.stringify(ringList));

  return {
    props: { tournament, users, players, ringList, teams }
  };
};

export default function Tournament({
  tournament,
  users,
  players,
  ringList,
  teams
}) {
  const [rings, setRings] = useState<any[]>(ringList);
  const [showSuccessText, setShowSuccessText] = useState(false);

  const unfinishedRegistrations = users
    .filter((user) => !user.player && !user.umpire)
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  const umpires = users.filter((user) => user.umpire);

  const handleSaveUmpires = async (values) => {
    const res = await fetch(`/api/player/umpires`, {
      method: "PATCH",
      body: JSON.stringify(values)
    });

    if (res.status === 200) {
      setShowSuccessText(true);
    }
  };

  const handleMakeWanted = async (id: string) => {
    const res = await fetch(`/api/player/${id}/wanted`, {
      method: "POST"
    });

    const createdRing = await res.json();
    setRings((prevRings) => prevRings.concat(createdRing));
  };

  const formInitials = Object.assign(
    {},
    ...players.map((player) => ({
      [`${player.id}`]: player.umpire ? player.umpire.id : ""
    }))
  );

  return (
    <AuthenticationRequired>
      <Box sx={{ m: 2 }}>
        <h1 style={{ width: "100%" }}>{tournament.name}</h1>
        <Grid container>
          <Grid item xs={12} md={6}>
            {unfinishedRegistrations.length > 0 && (
              <div style={{ paddingLeft: "10px", marginBottom: "30px" }}>
                <h2>Keskeneräiset ilmoittautumiset</h2>
                {unfinishedRegistrations.map((user) => (
                  <div key={user.id}>
                    <Link
                      href={`/tournaments/${tournament.id}/users/${user.id}`}
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <PlayerTable
              playerList={players}
              tournament={tournament}
              handleMakeWanted={handleMakeWanted}
            />
            <h2>Pelaajien tuomarit</h2>
            <Formik
              enableReinitialize={true}
              initialValues={formInitials}
              onSubmit={(values) => {
                handleSaveUmpires(values);
              }}
            >
              <Form>
                {players.map((player) => (
                  <div key={player.id}>
                    <div style={{ width: "100%" }}>
                      <label htmlFor={`${player.id}`}>
                        {player.user.firstName} {player.user.lastName}
                      </label>
                    </div>
                    <Field
                      name={`${player.id}`}
                      id={`${player.id}`}
                      as="select"
                    >
                      <option></option>
                      {umpires.map((user) => (
                        <option value={user.umpire.id} key={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </Field>
                  </div>
                ))}
                <button type="submit" style={{ width: "40%" }}>
                  Tallenna tuomarit
                </button>
                <p
                  style={{ visibility: showSuccessText ? "visible" : "hidden" }}
                >
                  Tuomarien tallentaminen onnistui!
                </p>
              </Form>
            </Formik>
          </Grid>
          <Grid item xs={12} md={3}>
            {tournament.teamGame ? (
              <TeamTournamentRings
                tournament={tournament}
                rings={rings}
                teams={teams}
                setRings={setRings}
              />
            ) : (
              <TournamentRings
                tournament={tournament}
                players={players}
                rings={rings}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </AuthenticationRequired>
  );
}
