import {
  Assignment,
  AssignmentRing,
  TeamAssignment,
  TeamAssignmentRing,
  Tournament
} from "@prisma/client";
import { PlayerTitle, PlayerState } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Player {
  id: string;
  title: PlayerTitle;
  alias: string;
  state: PlayerState;
  colorCode?: string;
}

interface Umpire {
  id: string;
  responsibility?: string;
  mainUmpire?: boolean;
}

interface Team {
  id: string;
  name: string;
  colorCode?: string;
}

interface UmpireWithUser extends Umpire {
  user: User;
}

export interface UmpirePagePlayer extends Player {
  user: User;
  targets: Assignment[];
  umpire: UmpireWithUser;
  team: Team;
  colorCode?: string;
}

export interface UmpirePageUser extends User {
  player: Player;
  umpire: Umpire;
  team: Team;
}

export interface UmpirePageTeam extends Team {
  players: UmpirePagePlayer[];
  colorCode?: string;
}

export interface RingWithAssignments extends AssignmentRing {
  assignments: Assignment[];
}

export interface TeamRingWithAssignments extends TeamAssignmentRing {
  assignments: TeamAssignment[];
}

export interface RingComponentProps {
  setPlayers?: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
  setPlayerRings?: Dispatch<SetStateAction<RingWithAssignments[]>>;
  playerRings?: RingWithAssignments[];
  players?: UmpirePagePlayer[];
  teamRings?: TeamRingWithAssignments[];
  setTeamRings?: Dispatch<SetStateAction<TeamRingWithAssignments[]>>;
  teams?: UmpirePageTeam[];
  tournament?: Tournament;
}
