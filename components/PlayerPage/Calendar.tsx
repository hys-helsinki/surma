import { Dispatch, JSX, useContext, useEffect, useState } from "react";
import { getCurrentWeek, getTournamentDates, splitCalendar } from "../utils";
import { Formik, Form, Field } from "formik";
import Markdown from "../Common/Markdown";
import { Tournament } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { UserContext } from "../UserProvider";
import { Button } from "@mui/material";

export const Calendar = ({
  tournament,
  showEditButton,
  setUser
}: {
  tournament: Tournament;
  showEditButton: boolean;
  setUser: Dispatch<any>;
}): JSX.Element => {
  const { t } = useTranslation("common");
  const user = useContext(UserContext);
  const [weekNumber, setSlideNumber] = useState(0);
  const [weeks, setWeeks] = useState([]);
  const [isUpdated, setIsUpdated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const calendar = user.player.calendar as any;

  useEffect(() => {
    if (calendar) {
      const weeks = splitCalendar(calendar);
      setWeeks(weeks);
      const currentWeek = getCurrentWeek(dates);
      if (currentWeek <= weeks.length - 1) {
        setSlideNumber(currentWeek);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendar]);

  if (!calendar) return null;

  const dates: string[] = getTournamentDates(
    new Date(tournament.startTime),
    new Date(tournament.endTime)
  );

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
      const res = await fetch(`/api/user/update/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      const updatedUser = await res.json();
      setUser(updatedUser);
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
          {isUpdated
            ? t("playerPage.calendar.editButton")
            : t("playerPage.calendar.cancelButton")}
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
            {t("playerPage.calendar.nextButton")}
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
            <Markdown>{t("playerPage.calendar.markdown")}</Markdown>
            <Button loading={isLoading} type="submit">
              {t("playerPage.calendar.saveButton")}
            </Button>
            {dates.map((date: string, index) => (
              <div key={index}>
                <label>{date}</label>
                <Field name={`calendar${index}`} as="textarea" />
              </div>
            ))}
            <Button loading={isLoading} type="submit">
              {t("playerPage.calendar.saveButton")}
            </Button>
          </Form>
        </Formik>
      )}
    </div>
  );
};
