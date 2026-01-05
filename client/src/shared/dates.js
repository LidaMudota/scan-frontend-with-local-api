export function formatISODate(date) {
  return date.toISOString().split('T')[0];
}

export function notInFuture(date) {
  const today = new Date();
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d <= today;
}

export function makeInterval(start, end) {
  return {
    startDate: `${start}T00:00:00+03:00`,
    endDate: `${end}T23:59:59+03:00`,
  };
}
