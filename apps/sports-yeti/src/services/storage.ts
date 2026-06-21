import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Platform-aware secure storage utility.
 * - Native (iOS/Android): expo-secure-store keychain entries.
 * - Web: window.localStorage (best-effort; not actually secure).
 *
 * `localStorage` is only referenced when Platform.OS === 'web' so the
 * native runtime never touches it. We pull it off `globalThis` to keep
 * the RN type checker happy without pulling in the full DOM lib.
 */

const isWeb = Platform.OS === 'web';

interface WebStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

function webStorage(): WebStorage | null {
  if (!isWeb) return null;
  const ls = (globalThis as { localStorage?: WebStorage }).localStorage;
  return ls ?? null;
}

export async function getItemAsync(key: string): Promise<string | null> {
  const ls = webStorage();
  if (ls) return ls.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  const ls = webStorage();
  if (ls) {
    ls.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  const ls = webStorage();
  if (ls) {
    ls.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
