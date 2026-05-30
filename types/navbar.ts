import { Player, Tournament, Umpire } from "@prisma/client";
import { User } from "next-auth";

interface Team {
  id: string;
  name: string;
}

export interface Target {
  id: string;
  firstName: string;
  lastName: string;
  team: Team;
}

interface PlayerWithTargets extends Player {
  targets: Target[];
}
export interface NavBarUser extends User {
  player: PlayerWithTargets;
  tournament: Tournament;
  umpire: Umpire;
}
