/**
 * Parses a string or number into a number.
 */
export const parseNumber = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return null;

  // Remove commas and trim whitespace
  const cleaned = val.replace(/,/g, '').trim();

  // Parse the cleaned string
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
};
