import { Box } from "@mui/material";
import { useContext } from "react";
import { UserContext } from "../../UserProvider";

const ContactDetails = ({
  showLastVisit
}: {
  showLastVisit: boolean;
}): JSX.Element => {
  const user = useContext(UserContext);
  return (
    <Box sx={{ my: 3 }}>
      <h2>
        <u>Yhteystiedot</u>
      </h2>
      <p>Puhelinnumero: {user.phone}</p>
      <p>Sähköpostiosoite: {user.email}</p>

      {showLastVisit && (
        <p>
          Viime vierailu:{" "}
          {`${new Date(user.player.lastVisit).toLocaleTimeString("fi-FI", {
            hour: "2-digit",
            minute: "2-digit",
            year: "numeric",
            day: "numeric",
            month: "numeric",
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          })}`}
        </p>
      )}
    </Box>
  );
};

export default ContactDetails;
