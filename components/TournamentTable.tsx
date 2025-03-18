import styles from "../styles/Home.module.css";
import Link from "next/link";
import { NoSsr } from "@mui/base/NoSsr";

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
      <Link href={`/tournaments/${tournament.id}/registration`}>
        Ilmoittautumislomake
      </Link>
    ) : (
      <p>Ilmoittautuminen ei ole vielä auki</p>
    );
    return registrationLink;
  };
  const tournamentsAvailable = tournaments.length > 0;
  if (tournamentsAvailable) {
    return (
      <table aria-label="tournament-table" className={styles.tournamentTable}>
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Turnaus käynnissä</th>
            <th>Ilmoittautuminen käynnissä</th>
            <th>Ilmoittautumislomake</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((tournament) => (
            <tr key={tournament.id}>
              <td>{tournament.name}</td>
              <td>
                <NoSsr>
                  {modifyDate(tournament.startTime)}&nbsp;-&nbsp;
                  {modifyDate(tournament.endTime)} (
                  {Intl.DateTimeFormat().resolvedOptions().timeZone})
                </NoSsr>
              </td>
              <td>
                <NoSsr>
                  {modifyDate(tournament.registrationStartTime)}
                  &nbsp;-&nbsp;{modifyDate(tournament.registrationEndTime)} (
                  {Intl.DateTimeFormat().resolvedOptions().timeZone})
                </NoSsr>
              </td>
              <td>{registration(tournament)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <p>
      {" "}
      Tulevia turnauksia ei ole juuri nyt tiedossa, joten palaathan myöhemmin
      takaisin. Tietoa tulevista turnauksista voi saada myös{" "}
      <a href="https://salamurhaajat.net/tulevat-tapahtumat">
        Helsingin yliopiston salamurhapelaajien eli HYSin nettisivuilta.
      </a>
    </p>
  );
};
export default TournamentTable;
