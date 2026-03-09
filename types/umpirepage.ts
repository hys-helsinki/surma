import {
  Assignment,
  AssignmentRing,
  Player,
  Team,
  TeamAssignment,
  TeamAssignmentRing,
  Tournament,
  Umpire,
  User
} from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

interface PlayerWithUser extends Player {
  user: User;
}

export interface UmpirePagePlayer extends Player {
  user: User;
  targets: Assignment[];
  umpire: Umpire;
  team: Team;
  colorCode?: string;
}

export interface UmpirePageUser extends User {
  player: Player;
  umpire: Umpire;
  team: Team;
}

export interface UmpirePageTeam extends Team {
  players: PlayerWithUser[];
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
