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

export const FIRST_NAMES = [
  "Тарас", "Остап", "Богдан", "Назар", "Данило",
  "Марко", "Артем", "Максим", "Роман", "Денис",
  "Андрій", "Орест", "Ярослав", "Святослав", "Владислав",
  "Матвій", "Захар", "Лука", "Нестор", "Гліб",
  "Анна", "Марія", "Софія", "Дарина", "Поліна",
  "Яна", "Олена", "Діана", "Вікторія", "Юлія"
];

export const LAST_NAMES = [
  "Шевченко", "Коваленко", "Бойко", "Мельник", "Кравчук",
  "Бондар", "Коваль", "Ткач", "Гончар", "Мороз",
  "Вовк", "Сокіл", "Савчук", "Мазур", "Поліщук",
  "Лисенко", "Руденко", "Марчук", "Козак", "Сидоренко",
  "Пасічник", "Гриценко", "Романюк", "Демчук", "Левченко",
  "Чумак", "Павленко", "Кушнір", "Юрченко", "Швець"
];

export function generateRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

