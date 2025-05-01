import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ActionResult } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data, error: null };
}

export function failure<T = unknown>(error: unknown, clientMessage: string = "An unknown error occurred"): ActionResult<T> {
  const message = typeof error === 'object' && error !== null && 'message' in error ? error.message : "An unknown error occurred";
  // console.log("error:", message);
  return { success: false, data: null, error: clientMessage };
}
