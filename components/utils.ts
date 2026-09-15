import { CalendarElement } from "./PlayerPage/Calendar";

export const getTournamentDates = (start: Date, end: Date) => {
  const dates: string[] = [];
  for (const date = start; date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(date.toString());
  }
  return dates;
};

export const splitCalendar = (calendar: CalendarElement[]) => {
  const weeks: CalendarElement[][] = [];
  const chunkSize = 7;

  for (let i = 0; i < calendar.length; i += chunkSize) {
    const chunk = calendar.slice(i, i + chunkSize);
    weeks.push(chunk);
  }
  return weeks;
};

export const getCurrentWeek = (weeks: CalendarElement[][]) => {
  const currentDate = new Date().toString();

  let currentWeekNumber = 0;

  for (let i = 0; i < weeks.length; i += 1) {
    if (weeks[i].map((entry) => entry.date).includes(currentDate)) {
      break;
    }
    currentWeekNumber += 1;
  }

  return currentWeekNumber;
};

export const getPlayerFullNameById = (playerId, players) => {
  if (!playerId) return;
  const searchedPlayer = players.find((player) => playerId == player.id);

  return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
};

export const modifyDate = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    day: "numeric",
    month: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};
