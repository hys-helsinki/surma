import { Dispatch, JSX, useContext, useEffect, useState } from "react";
import { getCurrentWeek, getTournamentDates, splitCalendar } from "../utils";
import { Formik, Form, Field } from "formik";
import Markdown from "../Common/Markdown";
import { Tournament } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { UserContext } from "../UserProvider";
import SurmaButton from "../Common/SurmaButton";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface CalendarElement {
  date: string;
  content: string;
}

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

  const dates: string[] = getTournamentDates(
    new Date(tournament.startTime),
    new Date(tournament.endTime)
  );

  const calendar: CalendarElement[] = dates.map(
    (date) =>
      (user.player.calendar as any)?.find((entry) => entry.date === date) ?? {
        date,
        content: ""
      }
  );

  const updateWeeks = (calendar: CalendarElement[]) => {
    const weeks = splitCalendar(calendar);
    setWeeks(weeks);
    const currentWeek = getCurrentWeek(weeks);
    if (currentWeek <= weeks.length - 1) {
      setSlideNumber(currentWeek);
    }
  };

  useEffect(() => {
    updateWeeks(calendar);
  }, []);

  if (weeks.length === 0) return null;

  const handleCalendarSubmit = async (values) => {
    setIsLoading(true);
    const updatedCalendar = dates.map((date) => ({
      date,
      content: values[`calendar-${date}`]
    }));

    const data = {
      calendar: updatedCalendar
    };

    try {
      const res = await fetch(`/api/user/update/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        throw new Error("Updating data failed");
      }
      const updatedUser = await res.json();
      setIsUpdated(true);
      setUser(updatedUser);
      updateWeeks(updatedUser.player.calendar);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const calendarInitials = dates.reduce((calendarObject, date) => {
    const currentCalendarObject = calendar.find((entry) => entry.date === date);
    calendarObject.push({
      [`calendar-${date}`]: currentCalendarObject?.content ?? ""
    });
    return calendarObject;
  }, [] as Array<Record<string, string>>);

  return (
    <div className="calendar">
      {showEditButton && (
        <SurmaButton onClick={() => setIsUpdated(!isUpdated)}>
          {isUpdated
            ? t("playerPage.calendar.editButton")
            : t("playerPage.calendar.cancelButton")}
        </SurmaButton>
      )}

      {isUpdated ? (
        <div>
          {weeks[weekNumber].map((entry) => {
            return (
              <Accordion
                key={entry.date}
                disableGutters
                square
                defaultExpanded={true}
                sx={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  mb: 1.5,
                  border: "1px solid rgba(34, 23, 23, 0.15)",
                  boxShadow: "0 4px 14px rgba(34, 23, 23, 0.08)"
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  sx={{
                    backgroundColor: "rgb(34, 23, 23)",
                    color: "white",
                    minHeight: "52px",
                    "& .MuiAccordionSummary-content": {
                      fontFamily: "monospace",
                      fontSize: "large"
                    },
                    "& .MuiAccordionSummary-expandIconWrapper": {
                      color: "white"
                    }
                  }}
                >
                  {`${new Date(entry.date).getDate()}.${
                    new Date(entry.date).getMonth() + 1
                  }.${new Date(entry.date).getFullYear()}`}
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: "rgb(34, 23, 23)",
                    color: "white",
                    borderTop: "2px solid white",
                    px: 2.5,
                    py: 2
                  }}
                >
                  <Markdown>{entry.content}</Markdown>
                </AccordionDetails>
              </Accordion>
            );
          })}

          <div
            style={{
              display: "flex",
              gap: "20px"
            }}
          >
            {weekNumber > 0 && (
              <SurmaButton onClick={() => setSlideNumber(weekNumber - 1)}>
                {t("playerPage.calendar.previousButton")}
              </SurmaButton>
            )}
            {weekNumber < weeks.length - 1 && (
              <SurmaButton onClick={() => setSlideNumber(weekNumber + 1)}>
                {t("playerPage.calendar.nextButton")}
              </SurmaButton>
            )}
          </div>
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
            <SurmaButton loading={isLoading} type="submit">
              {t("playerPage.calendar.saveButton")}
            </SurmaButton>
            {weeks.flat().map((entry, index) => {
              return (
                <div key={index}>
                  <label>{`${new Date(entry.date).getDate()}.${
                    new Date(entry.date).getMonth() + 1
                  }.${new Date(entry.date).getFullYear()}`}</label>
                  <Field
                    name={`calendar-${new Date(entry.date).toString()}`}
                    as="textarea"
                  />
                </div>
              );
            })}
            <SurmaButton loading={isLoading} type="submit">
              {t("playerPage.calendar.saveButton")}
            </SurmaButton>
          </Form>
        </Formik>
      )}
    </div>
  );
};
