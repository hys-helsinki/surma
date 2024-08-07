export const getTournamentDates = (start: Date, end: Date) => {
  const dates = [];
  for (const date = start; date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(`${date.getDate()}.${date.getMonth() + 1}`);
  }
  return dates;
};
