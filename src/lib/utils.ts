import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BREAKPOINTS, type Breakpoint } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ne-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
  }).format(new Date(date));
}

// Helper function
export const isBreakpoint = (breakpoint: Breakpoint): boolean => {
  return window.innerWidth >= BREAKPOINTS[breakpoint];
};
