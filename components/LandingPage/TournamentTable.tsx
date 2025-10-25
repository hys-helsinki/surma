import styles from "../../styles/Home.module.css";
import Link from "next/link";
import { NoSsr } from "@mui/base/NoSsr";
import { Box, Grid } from "@mui/material";

const TournamentTable = ({ tournaments }) => {
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
          Ilmoittaudu mukaan tästä!
        </Link>
      </p>
    ) : (
      <p>Ilmoittautuminen ei ole auki</p>
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
              borderTop: index > 0 && "0.5px solid white"
            }}
          >
            <Grid item xs={6} md={4}>
              <h3>Nimi</h3>
              <p>Syysturnaus 2025: Ruskan salaisuudet</p>
            </Grid>
            <Grid item xs={6} md={4}>
              <h3>Turnaus käynnissä</h3>
              <NoSsr>
                {modifyDate(tournament.startTime)}&nbsp;-&nbsp;
                {modifyDate(tournament.endTime)} (
                {Intl.DateTimeFormat().resolvedOptions().timeZone})
              </NoSsr>
            </Grid>
            <Grid item xs={12} md={4}>
              <h3>Ilmoittautuminen</h3>
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
      Tulevia turnauksia ei ole juuri nyt tiedossa, joten palaathan myöhemmin
      takaisin. Tietoa tulevista turnauksista voi saada myös{" "}
      <a href="https://salamurhaajat.net/tulevat-tapahtumat">
        Helsingin yliopiston salamurhapelaajien eli HYSin nettisivuilta.
      </a>
    </p>
  );
};
export default TournamentTable;
