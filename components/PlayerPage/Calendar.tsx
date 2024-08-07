import { useRouter } from "next/router";
import { useState } from "react";

export const Calendar = ({ player, tournament }): JSX.Element => {
  const [weekNumber, setSlideNumber] = useState(0);
  const [isUpdated, setIsUpdated] = useState(true);
  const router = useRouter();

  const { id } = router.query;

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);

  const dates: Array<any> = [];

  dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
  let loopDay = start;
  while (loopDay < end) {
    loopDay.setDate(loopDay.getDate() + 1);
    dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
  }

  const cal = [];
  for (const x in player.calendar) {
    cal.push([x, player.calendar[x]]);
  }

  let chunks = [];
  const chunkSize = 7;

  for (let i = 0; i < cal.length; i += chunkSize) {
    const chunk = cal.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  const handleSlideShow = (event) => {
    if (weekNumber == chunks.length - 1) {
      setSlideNumber(0);
    } else {
      setSlideNumber(weekNumber + 1);
    }
  };

  const handleCalendarSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const start = new Date(tournament.startTime);
    const end = new Date(tournament.endTime);
    let dates: Array<any> = [];
    dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
    let loopDay = start;
    while (loopDay < end) {
      loopDay.setDate(loopDay.getDate() + 1);
      dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
    }

    const cal = {};
    dates.forEach((x, i) => (cal[x] = event.currentTarget.dates[i].value));
    event.preventDefault();
    const data = {
      calendar: cal
    };

    try {
      await fetch(`/api/user/update/${id}`, {
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
      <h3 style={{ width: "40%", margin: "auto", padding: "10px" }}>
        Kalenteri
      </h3>
      <button onClick={() => setIsUpdated(!isUpdated)}>
        {isUpdated ? "Muokkaa kalenteria" : "Peruuta"}
      </button>

      {isUpdated ? (
        <div>
          <ul>
            {chunks[weekNumber].map((c, index) => (
              <li
                key={index}
                style={{ paddingBottom: "20px", whiteSpace: "pre-line" }}
              >
                {c[0]}: {c[1]}
              </li>
            ))}
          </ul>
          <button onClick={handleSlideShow} style={{ left: "40%" }}>
            Seuraava
          </button>
        </div>
      ) : (
        <div>
          <form onSubmit={handleCalendarSubmit}>
            <button type="submit">Tallenna muokkaukset</button>
            {cal.map((c, i) => (
              <div key={i}>
                <label htmlFor={c[0]}>
                  {c[0]}
                  <textarea id={c[0]} name="dates" defaultValue={c[1]} />
                </label>
              </div>
            ))}
          </form>
        </div>
      )}
    </div>
  );
};
