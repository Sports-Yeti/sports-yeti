/**
 * Web-only storage utility using localStorage
 * Since this admin app is web-only, we can use localStorage directly
 */

export async function getItemAsync(key: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
