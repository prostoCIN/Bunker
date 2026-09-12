import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomName(): string {
  const titles = ["Уцілілий", "Шукач", "Сталкер", "Рейнджер", "Дослідник", "Провідник", "Інженер"];
  const number = Math.floor(10 + Math.random() * 90);
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  return `${randomTitle} #${number}`;
}
