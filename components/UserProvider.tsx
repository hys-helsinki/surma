import { Player, User, Umpire } from "@prisma/client";
import { createContext } from "react";

interface UmpireWithUser extends Umpire {
  user: User;
}

interface PlayerWithUmpire extends Player {
  umpire: UmpireWithUser;
}
export interface UserWithPlayer extends User {
  player: PlayerWithUmpire;
}

interface UserProviderProps {
  children: React.ReactNode;
  user: UserWithPlayer | null;
}

export const UserContext = createContext<UserWithPlayer | null>(null);

export const UserProvider = ({ children, user }: UserProviderProps) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
