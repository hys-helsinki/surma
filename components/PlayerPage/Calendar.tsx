import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getCurrentWeek, getTournamentDates, splitCalendar } from "../utils";
import { Formik, Form, Field } from "formik";

export const Calendar = ({ player, tournament }): JSX.Element => {
  const [weekNumber, setSlideNumber] = useState(0);
  const [isUpdated, setIsUpdated] = useState(true);
  const router = useRouter();

  const { id: userId } = router.query;

  const dates: string[] = getTournamentDates(
    new Date(tournament.startTime),
    new Date(tournament.endTime)
  );

  const weeks = splitCalendar(player.calendar);

  useEffect(() => {
    const currentWeek = getCurrentWeek(dates);
    if (currentWeek <= weeks.length - 1) {
      setSlideNumber(currentWeek);
    }
  }, []);

  const handleSlideShow = () => {
    if (weekNumber == weeks.length - 1) {
      setSlideNumber(0);
    } else {
      setSlideNumber(weekNumber + 1);
    }
  };

  const handleCalendarSubmit = async (values) => {
    const calendar: string[][] = dates.map((date, index) => [
      date,
      values[`calendar${index}`]
    ]);

    const data = {
      calendar
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

  const calendarInitials = player.calendar.map((date, index) => ({
    [`calendar${index}`]: date[1]
  }));

  return (
    <div className="calendar">
      <button onClick={() => setIsUpdated(!isUpdated)}>
        {isUpdated ? "Muokkaa kalenteria" : "Peruuta"}
      </button>

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
          <button onClick={() => handleSlideShow()} style={{ left: "40%" }}>
            Seuraava
          </button>
        </div>
      ) : (
        <Formik
          enableReinitialize={true}
          initialValues={Object.assign({}, ...calendarInitials)}
          onSubmit={async (values) => {
            await handleCalendarSubmit(values);
          }}
        >
          <Form>
            <button type="submit">Tallenna muokkaukset</button>
            {dates.map((date: string, index) => (
              <div key={index}>
                <label>{date}</label>
                <Field name={`calendar${index}`} as="textarea" />
              </div>
            ))}
            <button type="submit">Tallenna muokkaukset</button>
          </Form>
        </Formik>
      )}
    </div>
  );
};
