import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combine clsx + tailwind-merge pour des classes conditionnelles propres. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
