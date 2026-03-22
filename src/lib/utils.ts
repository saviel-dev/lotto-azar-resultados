import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAnimalNumber(animal: string, num: number | string): string {
  const name = animal.toLowerCase();
  if (name === "delfín" || name === "delfin") return "0";
  if (name === "ballena") return "00";
  return String(num).padStart(2, "0");
}
