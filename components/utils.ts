export const getTournamentDates = (start: Date, end: Date) => {
  const dates = [];
  for (const date = start; date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(
      `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    );
  }
  return dates;
};

export const splitCalendar = (calendar: string[][]) => {
  const weeks: string[][][] = [];
  const chunkSize = 7;

  for (let i = 0; i < calendar.length; i += chunkSize) {
    const chunk = calendar.slice(i, i + chunkSize);
    weeks.push(chunk);
  }

  return weeks;
};

export const getCurrentWeek = (dates: string[]) => {
  const currentDate = new Date();

  const currentDateString = `${currentDate.getDate()}.${
    currentDate.getMonth() + 1
  }.${currentDate.getFullYear()}`;

  const weekLength = 7;
  let currentWeek = 0;

  for (let i = 0; i < dates.length; i += weekLength) {
    const chunk = dates.slice(i, i + weekLength);
    if (chunk.includes(currentDateString)) {
      break;
    }
    currentWeek += 1;
  }

  return currentWeek;
};
