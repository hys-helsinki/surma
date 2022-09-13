import { useState } from "react";

export const Calendar = ({ player }): JSX.Element => {
  const [slideNumber, setSlideNumber] = useState(0);

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
    if (slideNumber == chunks.length - 1) {
      setSlideNumber(0);
    } else {
      setSlideNumber(slideNumber + 1);
    }
  };

  return (
    <div className="calendar">
      <h3 style={{ width: "40%", margin: "auto", padding: "10px" }}>
        Kalenteri
      </h3>
      <ul>
        {chunks[slideNumber].map((c, index) => (
          <li key={index} style={{ paddingBottom: "20px" }}>
            {c[0]}: {c[1]}
          </li>
        ))}
      </ul>
      <button onClick={handleSlideShow}>Seuraava</button>
    </div>
  );
};
