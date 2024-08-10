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
      <Link href={`/registration/${tournament.id}`}>
        <a>Ilmoittautumislomake</a>
      </Link>
    ) : (
      <p>Ilmoittautuminen ei ole vielä auki</p>
    );
    return registrationLink;
  };
  return (
    <table aria-label="tournament-table" className={styles.tournamentTable}>
      <thead>
        <tr>
          <th>Nimi</th>
          <th>Turnaus käynnissä</th>
          <th>Ilmoittautuminen käynnissä</th>
          <th></th>
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
};
export default TournamentTable;
