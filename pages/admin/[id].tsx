import { Grid } from "@mui/material";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/TournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

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
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlayerStatusChange = (playerState, id) => {
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
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider"
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                      "& .MuiTabs-indicator": { backgroundColor: "white" },
                      "& .MuiTab-root": { color: "white" },
                      "& .Mui-selected": { color: "white" }
                    }}
                  >
                    <Tab label="Elossa" {...a11yProps(0)} />
                    <Tab label="Kuolleet" {...a11yProps(1)} />
                    <Tab label="Etsivät" {...a11yProps(2)} />
                  </Tabs>
                </Box>
                <TabPanel value={tabValue} index={0}>
                  <table>
                    <tbody>
                      {players
                        .filter((p) => p.state == "ACTIVE")
                        .map((player) => (
                          <tr key={player.id}>
                            <td>
                              <Link
                                href={`/tournaments/users/${player.user.id}`}
                              >
                                <a>
                                  {player.user.firstName} {player.user.lastName}
                                </a>
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  handlePlayerStatusChange("DEAD", player.id)
                                }
                              >
                                Tapa
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <table>
                    <tbody>
                      {players
                        .filter((p) => p.state == "DEAD")
                        .map((player) => (
                          <tr key={player.id}>
                            <td>
                              <Link
                                href={`/tournaments/users/${player.user.id}`}
                              >
                                <a>
                                  {player.user.firstName} {player.user.lastName}
                                </a>
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  handlePlayerStatusChange("ACTIVE", player.id)
                                }
                              >
                                Herätä henkiin
                              </button>
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  handlePlayerStatusChange(
                                    "DETECTIVE",
                                    player.id
                                  )
                                }
                              >
                                Etsiväksi
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  <table>
                    <tbody>
                      {players
                        .filter((p) => p.state == "DETECTIVE")
                        .map((player) => (
                          <tr key={player.id}>
                            <td>
                              <Link
                                href={`/tournaments/users/${player.user.id}`}
                              >
                                <a>
                                  {player.user.firstName} {player.user.lastName}
                                </a>
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  handlePlayerStatusChange("ACTIVE", player.id)
                                }
                              >
                                Herätä henkiin
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </TabPanel>
              </Box>
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
