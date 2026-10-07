import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Склеює класи й розумно вирішує конфлікти Tailwind:
 * cn("px-4", isBig && "px-8") → "px-8"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
