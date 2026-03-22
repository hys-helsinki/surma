import { Box } from "@mui/material";
import { JSX, useContext } from "react";
import { useTranslation } from "next-i18next";
import { UserContext } from "../../UserProvider";

const ContactDetails = ({
  showPhoneAndEmail
}: {
  showPhoneAndEmail: boolean;
}): JSX.Element => {
  const { t, i18n } = useTranslation("common");
  const locale = i18n?.language || "fi";
  const user = useContext(UserContext);

  return (
    <Box sx={{ my: 3 }}>
      {showPhoneAndEmail && (
        <>
          <h2>
            <u>{t("playerPage.details.contact.title")}</u>
          </h2>
          <p>
            {t("playerPage.details.contact.phoneLabel")}: {user.phone}
          </p>
          <p>
            {t("playerPage.details.contact.emailLabel")}: {user.email}
          </p>
        </>
      )}
      <p>
        {t("playerPage.details.contact.lastVisit")}:
        {user.player.lastVisit
          ? ` ${new Date(user.player.lastVisit).toLocaleString(locale, {
              hour: "2-digit",
              minute: "2-digit",
              year: "numeric",
              day: "numeric",
              month: "numeric",
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })}`
          : ` ${t("playerPage.details.contact.neverVisited")}`}
      </p>
    </Box>
  );
};

export default ContactDetails;
