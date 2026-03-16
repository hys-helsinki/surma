import Link from "next/link";
import { NoSsr } from "@mui/material";
import { Box, Grid } from "@mui/material";
import { useTranslation } from "next-i18next";

const TournamentTable = ({ tournaments }) => {
  const { t } = useTranslation("common");
  const modifyDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.toLocaleTimeString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      day: "numeric",
      month: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })}`;
    return formattedDate;
  };
  const registration = (tournament) => {
    const now = new Date().getTime();
    const isRegistrationOpen =
      now < new Date(tournament.registrationEndTime).getTime() &&
      now > new Date(tournament.registrationStartTime).getTime();
    const registrationLink = isRegistrationOpen ? (
      <p>
        <Link href={`/tournaments/${tournament.id}/registration`}>
          {t("landingPage.tournamentTable.registerLink")}
        </Link>
      </p>
    ) : (
      <p>{t("landingPage.tournamentTable.registrationNotOpen")}</p>
    );
    return registrationLink;
  };
  const tournamentsAvailable = tournaments.length > 0;
  if (tournamentsAvailable) {
    return (
      <Box my={3}>
        {tournaments.map((tournament, index) => (
          <Grid
            container
            key={tournament.id}
            sx={{
              borderTop: index > 0 ? "0.5px solid white" : undefined
            }}
          >
            <Grid size={{ xs: 6, md: 4 }}>
              <h3>{t("landingPage.tournamentTable.name")}</h3>
              <p>{tournament.name}</p>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <h3>{t("landingPage.tournamentTable.tournamentRunning")}</h3>
              <NoSsr>
                {modifyDate(tournament.startTime)}&nbsp;-&nbsp;
                {modifyDate(tournament.endTime)} (
                {Intl.DateTimeFormat().resolvedOptions().timeZone})
              </NoSsr>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <h3>{t("landingPage.tournamentTable.registration")}</h3>
              <NoSsr>
                {modifyDate(tournament.registrationStartTime)}
                &nbsp;-&nbsp;{modifyDate(tournament.registrationEndTime)} (
                {Intl.DateTimeFormat().resolvedOptions().timeZone})
              </NoSsr>
              {registration(tournament)}
            </Grid>
          </Grid>
        ))}
      </Box>
    );
  }
  return (
    <p>
      {t("landingPage.tournamentTable.noTournamentsMessage")}
      <a href="https://salamurhaajat.net/tulevat-tapahtumat">
        {t("landingPage.tournamentTable.hysinEventsLink")}
      </a>
    </p>
  );
};
export default TournamentTable;
