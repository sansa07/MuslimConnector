import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface IconProps {
  className?: string;
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Islamic date converter helpers
export function getHijriDate(): string {
  const date = new Date();
  // This is a simplistic approach - in a real app you would use a proper Hijri calendar library
  // or an API to get the accurate Hijri date
  const options: Intl.DateTimeFormatOptions = {
    calendar: 'islamic',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  return new Intl.DateTimeFormat('ar-SA', options).format(date);
}

export function getIslamicGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "صباح الخير"; // Sabah-al khayr (Good morning)
  } else if (hour >= 12 && hour < 18) {
    return "مساء الخير"; // Masa-al khayr (Good afternoon)
  } else {
    return "السلام عليكم"; // Assalamu alaikum (Peace be upon you)
  }
}

export function getGreetingTranslation(greeting: string): string {
  const greetings: Record<string, string> = {
    "صباح الخير": "Günaydın (Sabahınız Hayırlı Olsun)",
    "مساء الخير": "İyi Günler (Gününüz Hayırlı Olsun)",
    "السلام عليكم": "Selamünaleyküm (Allah'ın Selamı Üzerinize Olsun)"
  };
  
  return greetings[greeting] || "Selamünaleyküm";
}
