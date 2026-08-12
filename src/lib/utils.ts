import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Prefixes a public/ asset path with Vite's base path, so absolute asset
// references still resolve when the app is deployed under a sub-path.
export function withBase(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
