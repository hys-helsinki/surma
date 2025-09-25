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
  showPhoneAndEmail,
  setUser
}: {
  umpires: UmpireWithUser[];
  showPhoneAndEmail: boolean;
  setUser: Dispatch<any>;
}) => {
  return (
    <Box>
      <ContactDetails showPhoneAndEmail={showPhoneAndEmail} />
      <Umpires umpires={umpires} />
      <PlayerDescription setUser={setUser} />
    </Box>
  );
};

export default Details;
