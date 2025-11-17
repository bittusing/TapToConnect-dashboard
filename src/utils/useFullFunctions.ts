export const isWithinNext24Hours = (date: Date): boolean => {
  const now = new Date();
  const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return date > now && date <= future;
};

export const isPast24Hours = (date: Date): boolean => {
  const now = new Date();
  return date < now;
};

export const isWithinPast24Hours = (date: Date): boolean => {
  const now = new Date();
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return date >= past24Hours && date <= now;
};
