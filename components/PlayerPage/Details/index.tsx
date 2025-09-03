import { Box } from "@mui/material";
import PlayerDescription from "./PlayerDescription";
import ContactDetails from "./ContactDetails";
import Umpires from "./Umpires";
import { Umpire, User } from "@prisma/client";
import { Dispatch } from "react";

interface UmpireWithUser extends Umpire {
  user: User;
}

const Details = ({
  umpires,
  currentUserIsUmpire,
  currentUserIsHunter,
  setUser
}: {
  umpires: UmpireWithUser[];
  currentUserIsUmpire: boolean;
  currentUserIsHunter: boolean;
  setUser: Dispatch<any>;
}) => {
  return (
    <Box>
      {!currentUserIsHunter && (
        <ContactDetails showLastVisit={currentUserIsUmpire} />
      )}
      <Umpires umpires={umpires} />
      <PlayerDescription
        showUpdateButton={!currentUserIsHunter && !currentUserIsUmpire}
        setUser={setUser}
      />
    </Box>
  );
};

export default Details;
