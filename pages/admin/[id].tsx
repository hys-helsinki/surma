import { Box, Tabs, Tab } from "@mui/material";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";
import PlayerTable from "../../components/Admin/PlayerTable";
import TeamTable from "../../components/Admin/TeamTable";
import UmpireSelect from "../../components/Admin/UmpireSelect";
import Settings from "../../components/UmpirePage/Settings";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { useRouterLoading } from "../../lib/hooks";
import Rings from "../../components/Admin/Rings/Rings";
import { Tournament } from "@prisma/client";
import {
  RingWithAssignments,
  UmpirePagePlayer,
  UmpirePageUser,
  TeamRingWithAssignments,
  UmpirePageTeam
} from "../../types/umpirepage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

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
  const session = await getServerSession(context.req, context.res, authConfig);

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
      },
      targets: true
    }
  });

  let playerRings = await prisma.assignmentRing.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      assignments: true
    }
  });

  let teamRings = await prisma.teamAssignmentRing.findMany({
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
  playerRings = JSON.parse(JSON.stringify(playerRings));
  teamRings = JSON.parse(JSON.stringify(teamRings));

  return {
    props: {
      tournament,
      users,
      players,
      playerRings,
      teamRings,
      teams,
      ...(await serverSideTranslations(context.locale, ["common"]))
    }
  };
};

export default function UmpirePage({
  tournament,
  users,
  players: playerList,
  playerRings: playerRingList,
  teamRings: teamRingList,
  teams
}: {
  tournament: Tournament;
  users: UmpirePageUser[];
  players: UmpirePagePlayer[];
  playerRings: RingWithAssignments[];
  teamRings: TeamRingWithAssignments[];
  teams: UmpirePageTeam[];
}) {
  const [playerRings, setRings] =
    useState<RingWithAssignments[]>(playerRingList);
  const [teamRings, setTeamRings] =
    useState<TeamRingWithAssignments[]>(teamRingList);
  const [players, setPlayers] = useState<UmpirePagePlayer[]>(playerList);
  const [value, setValue] = useState(0);

  const isLoading = useRouterLoading();
  if (isLoading) return <LoadingSpinner />;

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
            <Tab label="Asetukset" />
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
              players={players}
              setPlayers={setPlayers}
              tournament={tournament}
              setRings={setRings}
              users={users}
            />
          )}
        </TabPanel>
        <TabPanel value={value} index={2}>
          <UmpireSelect
            umpires={umpires}
            players={players}
            tournament={tournament}
            setPlayers={setPlayers}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Rings
            players={players}
            playerRings={playerRings}
            teamRings={teamRings}
            setTeamRings={setTeamRings}
            tournament={tournament}
            setPlayers={setPlayers}
            setPlayerRings={setRings}
            teams={teams}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Settings tournament={tournament} umpireUsers={umpires} />
        </TabPanel>
      </Box>
    </AuthenticationRequired>
  );
}
