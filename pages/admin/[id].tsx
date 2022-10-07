import { Grid } from "@mui/material";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/TournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";

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
  let players = await prisma.player.findMany({
    where: {
      tournamentId: params.id as string
    },
    select: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      id: true,
      targets: true,
      hunters: true,
      state: true
    }
  });
  let rings = await prisma.assignmentRing.findMany({
    where: {
      tournamentId: params.id as string
    },
    select: {
      id: true,
      name: true,
      assignments: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament));
  const playerList = JSON.parse(JSON.stringify(players));
  rings = JSON.parse(JSON.stringify(rings));
  return {
    props: { tournament, playerList, rings }
  };
};

export default function Tournament({ tournament, playerList, rings }) {
  const [players, setPlayers] = useState(playerList);
  const handlePlayerStatus = (playerState, id) => {
    const data = { state: playerState };
    fetch(`/api/player/${id}/state`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    const playerToBeUpdated = players.find((p) => p.id == id);
    const updatedPlayer = { ...playerToBeUpdated, state: playerState };
    setPlayers(
      players.map((player) => (player.id !== id ? player : updatedPlayer))
    );
  };
  return (
    <AuthenticationRequired>
      <div>
        <h2 style={{ width: "100%" }}>{tournament.name}</h2>
        <Grid container>
          <Grid item xs={12} md={6}>
            <div style={{ paddingLeft: "10px" }}>
              <h2>Pelaajat</h2>
              <table>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td>
                        <Link href={`/tournaments/users/${player.user.id}`}>
                          <a>
                            {player.user.firstName} {player.user.lastName}
                          </a>
                        </Link>
                      </td>
                      {player.state == "ACTIVE" ? (
                        <td>
                          <button
                            onClick={() =>
                              handlePlayerStatus("DEAD", player.id)
                            }
                          >
                            Tapa
                          </button>
                        </td>
                      ) : (
                        <>
                          <td>
                            <button
                              onClick={() =>
                                handlePlayerStatus("ACTIVE", player.id)
                              }
                            >
                              Herätä henkiin
                            </button>
                          </td>
                          {player.state != "DETECTIVE" && (
                            <td>
                              <button
                                onClick={() =>
                                  handlePlayerStatus("DETECTIVE", player.id)
                                }
                              >
                                Etsiväksi
                              </button>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div>
              <TournamentRings
                tournament={tournament}
                players={players}
                rings={rings}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </AuthenticationRequired>
  );
}
