import { Box } from "@mui/material";
import { useContext } from "react";
import { UserContext } from "../../UserProvider";

const ContactDetails = ({
  showPhoneAndEmail
}: {
  showPhoneAndEmail: boolean;
}): JSX.Element => {
  const user = useContext(UserContext);
  return (
    <Box sx={{ my: 3 }}>
      {showPhoneAndEmail && (
        <>
          <h2>
            <u>Yhteystiedot</u>
          </h2>
          <p>Puhelinnumero: {user.phone}</p>
          <p>Sähköpostiosoite: {user.email}</p>
        </>
      )}
      <p>
        Viime vierailu:
        {user.player.lastVisit
          ? ` ${new Date(user.player.lastVisit).toLocaleTimeString("fi-FI", {
              hour: "2-digit",
              minute: "2-digit",
              year: "numeric",
              day: "numeric",
              month: "numeric",
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })}`
          : " pelaaja ei ole vieraillut Surmassa kirjautumisen jälkeen"}
      </p>
    </Box>
  );
};

export default ContactDetails;
