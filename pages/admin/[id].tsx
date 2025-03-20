import { Grid, Box, Tabs, Tab } from "@mui/material";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/Admin/Rings/TournamentRings";
import { TeamTournamentRings } from "../../components/Admin/Rings/TeamTournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";
import PlayerTable from "../../components/Admin/PlayerTable";
import TeamTable from "../../components/Admin/TeamTable";
import UmpireSelect from "../../components/Admin/UmpireSelect";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box padding={2}>{children}</Box>}
    </div>
  );
};

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
      umpire: true,
      team: true
    }
  });

  let players = await prisma.player.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      user: true,
      team: true,
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
    },
    include: {
      players: {
        include: {
          user: true
        }
      }
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
  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const umpires = users.filter((user) => user.umpire);

  return (
    <AuthenticationRequired>
      <Box sx={{ m: 2 }}>
        <h1 style={{ width: "100%" }}>{tournament.name}</h1>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleTabChange}
            variant="scrollable"
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: "#f72a2a"
              }
            }}
          >
            <Tab label="Pelaajat" />
            <Tab label="Ringit" />
            <Tab label="Tuomarien asettaminen" />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          {tournament.teamGame ? (
            <TeamTable
              tournament={tournament}
              teams={teams}
              users={users}
              setRings={setRings}
            />
          ) : (
            <PlayerTable
              playerList={players}
              tournament={tournament}
              setRings={setRings}
            />
          )}
        </TabPanel>
        <TabPanel value={value} index={2}>
          <UmpireSelect
            umpires={umpires}
            players={players}
            teamGame={tournament.teamGame}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
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
        </TabPanel>
      </Box>
    </AuthenticationRequired>
  );
}
