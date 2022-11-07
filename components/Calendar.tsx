import { useState } from "react";

export const Calendar = ({ player, handleSubmit }): JSX.Element => {
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

  const dates = cal.map(
    (c) =>
      new Date(
        new Date().getFullYear(),
        parseInt(c[0].split(".")[1]) - 1,
        parseInt(c[0].split(".")[0])
      )
  );

  let dateIndex = 0;
  const now = new Date();
  for (let i = 0; i < dates.length; i++) {
    console.log(dates[i].getDate(), dates[i].getMonth() + 1);
    if (
      now.getDate() == dates[i].getDate() &&
      now.getMonth() == dates[i].getMonth()
    ) {
      dateIndex = i;
    }
  }
  const getInitialSlideNumber = (index) => {
    const i = index % 7;
    return (index - i) / 7;
  };

  const initialSlideNumber = getInitialSlideNumber(dateIndex);

  const [slideNumber, setSlideNumber] = useState(initialSlideNumber);
  const [isUpdated, setIsUpdated] = useState(true);

  const handleSlideShow = (event) => {
    if (slideNumber == chunks.length - 1) {
      setSlideNumber(0);
    } else {
      setSlideNumber(slideNumber + 1);
    }
  };

  const handleEditCalendarButton = (event) => {
    if (isUpdated === true) {
      setIsUpdated(false);
    } else {
      setIsUpdated(true);
    }
  };

  return (
    <div className="calendar">
      <h3 style={{ width: "40%", margin: "auto", padding: "10px" }}>
        Kalenteri
      </h3>
      <button onClick={handleEditCalendarButton}>
        {isUpdated ? "muokkaa kalenteria" : "peruuta"}
      </button>
      {isUpdated ? (
        <div>
          <ul>
            {chunks[slideNumber].map((c, index) => (
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
          <form onSubmit={handleSubmit}>
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
