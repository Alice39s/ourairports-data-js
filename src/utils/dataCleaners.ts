/**
 * Convert full-width characters to half-width characters
 */
export function fullWidthToHalfWidth(str: string): string {
  return str.replace(/[\uff01-\uff5e]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  ).replace(/\u3000/g, ' ');
}

/**
 * Check if the string contains spam information
 */
export function containsSpam(str: string): boolean {
  // Both "(spam)" and " spam " are considered spam
  return /\(spam\)/i.test(str.toLowerCase()) || / spam /i.test(str.toLowerCase());
}

/**
 * Clean airport name
 */
export function cleanAirportName(name: string): string {
  const cleaned = fullWidthToHalfWidth(name);
  return cleaned;
}

/**
 * Validate airport data
 */
export function isValidAirport(name: string): boolean {
  if (!name || name.length < 3) return false
  if (containsSpam(name)) return false;
  return true;
} 