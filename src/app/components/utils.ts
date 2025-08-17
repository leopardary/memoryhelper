import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const DESCRIPTION_SEPARATOR = '##';
export const SENTENCE_SEPARATOR = '/';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleRead = async (text: string) => {
  const res = await fetch("/api/read-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  const url = data?.url;
  const audio = new Audio(url);
  audio.play();
};
