import { Player, Tournament, Umpire, UserRole } from "@prisma/client";
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
  role: UserRole;
  player: PlayerWithTargets;
  tournament: Tournament;
  umpire: Umpire;
}
