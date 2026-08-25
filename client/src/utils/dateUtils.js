export const getMonday = () => {
  const today = new Date();
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
  today.setDate(today.getDate() + diff);
  return today.toLocaleDateString('en-CA');
};

export const getToday = () => new Date().toLocaleDateString('en-CA');
export const getStartOfDay = () => `${getToday()}T00:00:00`;
export const getEndOfDay = () => `${getToday()}T23:59:59`;
export const toDatetimeLocalValue = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
