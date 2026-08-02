export const getMonday = () => {
  const today = new Date();
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
  today.setDate(today.getDate() + diff);
  return today.toLocaleDateString('en-CA');
};

export const getToday = () => new Date().toLocaleDateString('en-CA');
export const getStartOfDay = () => `${getToday()}T00:00:00`;
export const getEndOfDay = () => `${getToday()}T23:59:59`;
