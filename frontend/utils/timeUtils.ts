export function isValidTimeFormat(time: string): boolean {
  // Format: HH:MM where HH is 00-23 and MM is 00-59
  const pattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return pattern.test(time);
}

export function incrementHours(time: string, increment: number = 1): string {
  if (!isValidTimeFormat(time)) {
    return time;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  const newHours = (hours + increment + 24) % 24;
  
  return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function incrementMinutes(time: string, increment: number = 15): string {
  if (!isValidTimeFormat(time)) {
    return time;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + increment;
  
  // Handle negative and overflow
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  
  const newHours = Math.floor(normalizedMinutes / 60);
  const newMinutes = normalizedMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

export function formatTimeDisplay(time: string): string {
  if (!isValidTimeFormat(time)) {
    return time;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  
  let displayHours = hours;
  let period = 'AM';
  
  if (hours === 0) {
    displayHours = 12;
  } else if (hours === 12) {
    period = 'PM';
  } else if (hours > 12) {
    displayHours = hours - 12;
    period = 'PM';
  }
  
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}
