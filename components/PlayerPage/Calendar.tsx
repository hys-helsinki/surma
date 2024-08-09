import { useRouter } from "next/router";
import { useState } from "react";
import { getTournamentDates, splitCalendar } from "../utils";

export const Calendar = ({ player, tournament }): JSX.Element => {
  const [weekNumber, setSlideNumber] = useState(0);
  const [isUpdated, setIsUpdated] = useState(true);
  const router = useRouter();

  const { id: userId } = router.query;

  const dates = getTournamentDates(
    new Date(tournament.startTime),
    new Date(tournament.endTime)
  );

  const weeks = splitCalendar(player.calendar);

  const handleSlideShow = (event) => {
    if (weekNumber == weeks.length - 1) {
      setSlideNumber(0);
    } else {
      setSlideNumber(weekNumber + 1);
    }
  };

  const handleCalendarSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const cal = {};
    dates.forEach((x, i) => (cal[x] = event.currentTarget.dates[i].value));
    event.preventDefault();
    const data = {
      calendar: cal
    };

    try {
      await fetch(`/api/user/update/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      router.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="calendar">
      <button onClick={() => setIsUpdated(!isUpdated)}>
        {isUpdated ? "Muokkaa kalenteria" : "Peruuta"}
      </button>
      <h3 style={{ width: "40%", margin: "auto", padding: "10px" }}>
        Kalenteri
      </h3>

      {isUpdated ? (
        <div>
          <ul>
            {weeks[weekNumber].map((calendarElement: string[], index) => (
              <li
                key={index}
                style={{ paddingBottom: "20px", whiteSpace: "pre-line" }}
              >
                {calendarElement[0]}: {calendarElement[1]}
              </li>
            ))}
          </ul>
          <button onClick={handleSlideShow} style={{ left: "40%" }}>
            Seuraava
          </button>
        </div>
      ) : (
        <div>
          {/* <form onSubmit={handleCalendarSubmit}>
            <button type="submit">Tallenna muokkaukset</button>
            {cal.map((c, i) => (
              <div key={i}>
                <label htmlFor={c[0]}>
                  {c[0]}
                  <textarea id={c[0]} name="dates" defaultValue={c[1]} />
                </label>
              </div>
            ))}
          </form> */}
          lol
        </div>
      )}
    </div>
  );
};
