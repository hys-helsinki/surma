import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getCurrentWeek, getTournamentDates, splitCalendar } from "../utils";
import { Formik, Form, Field } from "formik";
import Markdown from "../Common/Markdown";
import { LoadingButton } from "@mui/lab";

export const Calendar = ({
  player,
  tournament,
  showEditButton
}): JSX.Element => {
  const [calendar, setCalendar] = useState(player.calendar);
  const [weekNumber, setSlideNumber] = useState(0);
  const [weeks, setWeeks] = useState([]);
  const [isUpdated, setIsUpdated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!calendar) return null;

  const { id: userId } = router.query;

  const dates: string[] = getTournamentDates(
    new Date(tournament.startTime),
    new Date(tournament.endTime)
  );

  useEffect(() => {
    const weeks = splitCalendar(calendar);
    setWeeks(weeks);
    const currentWeek = getCurrentWeek(dates);
    if (currentWeek <= weeks.length - 1) {
      setSlideNumber(currentWeek);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendar]);

  if (weeks.length === 0) return null;

  const handleSlideShow = () => {
    if (weekNumber == weeks.length - 1) {
      setSlideNumber(0);
    } else {
      setSlideNumber(weekNumber + 1);
    }
  };

  const handleCalendarSubmit = async (values) => {
    setIsLoading(true);
    const updatedCalendar: string[][] = dates.map((date, index) => [
      date,
      values[`calendar${index}`]
    ]);

    const data = {
      calendar: updatedCalendar
    };

    try {
      const res = await fetch(`/api/user/update/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      const updatedPlayer = await res.json();
      setCalendar(updatedPlayer.calendar);
      setIsUpdated(true);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const calendarInitials = calendar.map((date, index) => ({
    [`calendar${index}`]: date[1]
  }));

  return (
    <div className="calendar">
      {showEditButton && (
        <button onClick={() => setIsUpdated(!isUpdated)}>
          {isUpdated ? "Muokkaa kalenteria" : "Peruuta"}
        </button>
      )}

      {isUpdated ? (
        <div>
          <ul>
            {weeks[weekNumber].map((calendarElement: string[], index) => (
              <li
                key={index}
                style={{ paddingBottom: "20px", whiteSpace: "pre-line" }}
              >
                <p>{calendarElement[0]}</p>
                <Markdown>{calendarElement[1]}</Markdown>
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
            <Markdown>
              Kalenteri tukee
              [Markdown-syntaksia](https://www.markdownguide.org/basic-syntax/)
            </Markdown>
            <LoadingButton loading={isLoading} type="submit">
              Tallenna muokkaukset
            </LoadingButton>
            {dates.map((date: string, index) => (
              <div key={index}>
                <label>{date}</label>
                <Field name={`calendar${index}`} as="textarea" />
              </div>
            ))}
            <LoadingButton loading={isLoading} type="submit">
              Tallenna muokkaukset
            </LoadingButton>
          </Form>
        </Formik>
      )}
    </div>
  );
};
