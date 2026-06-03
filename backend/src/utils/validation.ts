export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const isMinLength = (value: unknown, min = 6): value is string =>
  typeof value === 'string' && value.trim().length >= min;

export const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const parseIntSafe = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const isPositiveInteger = (value: unknown): boolean => {
  const parsed = parseIntSafe(value);
  return parsed !== undefined && parsed > 0;
};
