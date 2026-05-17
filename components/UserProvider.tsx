import { Player, User, Umpire, Team } from "@prisma/client";
import { createContext } from "react";

interface UmpireWithUser extends Umpire {
  user: User;
}

interface PlayerPagePlayer extends Player {
  umpire: UmpireWithUser;
  team: Team;
}
export interface UserWithPlayer extends User {
  player: PlayerPagePlayer;
}

interface UserProviderProps {
  children: React.ReactNode;
  user: UserWithPlayer | null;
}

export const UserContext = createContext<UserWithPlayer | null>(null);

export const UserProvider = ({ children, user }: UserProviderProps) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
