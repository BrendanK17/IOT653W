import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeInput(input: string, maxLength: number = 100): string {
  if (typeof input !== 'string') return '';
  // Trim whitespace
  let sanitized = input.trim();
  // Limit length
  sanitized = sanitized.substring(0, maxLength);
  // Remove potentially dangerous chars, allow alphanumeric, spaces, basic punctuation
  sanitized = sanitized.replace(/[^\w\s\.,!?\-\'\"]/g, '');
  return sanitized;
}