/**
 Explanation
  clsx is sufficient for merging and conditionally applying classes.
  UnoCSS automatically handles conflicting classes (e.g., bg-red-500 vs. bg-blue-500) during build time, so you don’t need twMerge to resolve conflicts dynamically.
  Optional: Custom Conflict Resolution
  If you need more advanced class merging (e.g., resolving conflicts dynamically), you can write a custom utility function. However, this is rarely necessary with UnoCSS since it resolves styles at build time.

  This change should work seamlessly with UnoCSS.
 */
import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
