import { useRouter } from "next/router";

export default function CreateTournament() {
  const router = useRouter();
  const handleSubmit = async (event) => {
    event.preventDefault();

    const [s_year, s_month, s_day] =
      event.target.registration_start.value.split("-");
    const [s_hours, s_minutes] =
      event.target.registration_time_start.value.split(":");
    const [e_year, e_month, e_day] =
      event.target.registration_end.value.split("-");
    const [e_hours, e_minutes] =
      event.target.registration_time_end.value.split(":");

    const startDate = new Date(
      +s_year,
      +s_month - 1,
      +s_day,
      +s_hours,
      +s_minutes
    );
    const endDate = new Date(
      +e_year,
      +e_month - 1,
      +e_day,
      +e_hours,
      +e_minutes
    );

    const data = {
      name: event.target.tournament_label.value,
      start: new Date(event.target.start.value),
      end: new Date(event.target.end.value),
      registrationStart: startDate,
      registrationEnd: endDate
    };

    fetch("/api/tournament/create", {
      method: "POST",
      body: JSON.stringify(data)
    }).then((response) => {
      router.push({ pathname: "/admin" });
    });
  };
  return (
    <div>
      <h2>Turnauksen luominen</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="tournament_label">
          Turnauksen nimi:
          <input
            type="text"
            id="tournament_label"
            name="tournament_label"
          ></input>
        </label>
        <label htmlFor="start">
          Aloituspäivämäärä:
          <input type="date" id="start" name="start"></input>
        </label>
        <label htmlFor="end">
          Lopetuspäivämäärä:
          <input type="date" id="end" name="end"></input>
        </label>
        <h3>Ilmoittautuminen</h3>
        <label htmlFor="registration_start">
          alkaa
          <input
            type="date"
            id="registration_start"
            name="registration_start"
          ></input>
          <input
            type="time"
            id="registration_time_start"
            name="registration_time_start"
          ></input>
        </label>
        <label htmlFor="registration_end">
          päättyy
          <input
            type="date"
            id="registration_end"
            name="registration_end"
          ></input>
          <input
            type="time"
            id="registration_time_end"
            name="registration_time_end"
          ></input>
        </label>
        <button type="submit">Luo turnaus</button>
      </form>
    </div>
  );
}
