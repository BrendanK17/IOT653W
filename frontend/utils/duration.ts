/**
 * Format duration in minutes to a human-readable string with units.
 * @param minutes - Duration in minutes (number)
 * @returns Formatted string like "1 hour 10 minutes" or "45 minutes"
 */
export function formatDuration(minutes: number | string): string {
  const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
  
  if (!mins || mins <= 0) {
    return '0 minutes';
  }
  
  if (mins < 60) {
    const minuteText = mins === 1 ? 'minute' : 'minutes';
    return `${mins} ${minuteText}`;
  }
  
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  
  const hourText = hours === 1 ? 'hour' : 'hours';
  
  if (remainingMins === 0) {
    return `${hours} ${hourText}`;
  }
  
  const minuteText = remainingMins === 1 ? 'minute' : 'minutes';
  return `${hours} ${hourText} ${remainingMins} ${minuteText}`;
}
