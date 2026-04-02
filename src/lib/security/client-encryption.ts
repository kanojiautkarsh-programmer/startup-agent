import { encrypt, decrypt, generateUserKey, type EncryptedData } from './encryption';

export interface ClientKeyManager {
  getOrCreateKey(): Promise<string>;
  exportEncryptedKey(userPassword: string): Promise<string>;
  importEncryptedKey(encryptedKey: string, userPassword: string): Promise<string>;
  rotateKey(): Promise<string>;
  getKeyFingerprint(): Promise<string>;
}

const KEY_STORAGE_KEY = 'e2ee_user_key';
const ENCRYPTED_KEY_STORAGE_KEY = 'e2ee_encrypted_key';

export async function initializeClientEncryption(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Client encryption can only be initialized in browser');
  }

  const existingKey = localStorage.getItem(KEY_STORAGE_KEY);
  if (!existingKey) {
    const newKey = generateUserKey();
    localStorage.setItem(KEY_STORAGE_KEY, newKey);
  }
}

export async function getClientKey(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Client keys can only be accessed in browser');
  }

  const key = localStorage.getItem(KEY_STORAGE_KEY);
  if (!key) {
    await initializeClientEncryption();
    return localStorage.getItem(KEY_STORAGE_KEY)!;
  }
  return key;
}

export async function encryptForStorage(
  plaintext: string,
  additionalContext?: string
): Promise<EncryptedData> {
  const key = await getClientKey();
  const contextKey = additionalContext ? `${key}:${additionalContext}` : key;
  return encrypt(plaintext, contextKey);
}

export async function decryptFromStorage(
  encrypted: EncryptedData,
  additionalContext?: string
): Promise<string> {
  const key = await getClientKey();
  const contextKey = additionalContext ? `${key}:${additionalContext}` : key;
  return decrypt(encrypted, contextKey);
}

export interface EncryptedStorage {
  data: string;
  iv: string;
  authTag: string;
  salt: string;
}

export async function encryptObject<T>(obj: T): Promise<EncryptedStorage> {
  const jsonString = JSON.stringify(obj);
  const encrypted = await encryptForStorage(jsonString);
  return {
    data: encrypted.ciphertext,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    salt: encrypted.salt,
  };
}

export async function decryptObject<T>(encrypted: EncryptedStorage): Promise<T> {
  const decrypted = await decryptFromStorage({
    ciphertext: encrypted.data,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    salt: encrypted.salt,
  });
  return JSON.parse(decrypted) as T;
}

export async function exportUserKey(userPassword: string): Promise<string> {
  const key = await getClientKey();
  const exported = encrypt(key, userPassword);
  return JSON.stringify(exported);
}

export async function importUserKey(encryptedKey: string, userPassword: string): Promise<void> {
  const parsed = JSON.parse(encryptedKey) as EncryptedData;
  const decryptedKey = decrypt(parsed, userPassword);
  localStorage.setItem(KEY_STORAGE_KEY, decryptedKey);
}

export async function hasStoredKey(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY_STORAGE_KEY) !== null;
}

export async function clearClientKey(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY_STORAGE_KEY);
  localStorage.removeItem(ENCRYPTED_KEY_STORAGE_KEY);
}

export async function getKeyFingerprint(): Promise<string> {
  const key = await getClientKey();
  const crypto = window.crypto || (window as unknown as { webkitCrypto: Crypto }).webkitCrypto;
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

export function setupKeyRotationHandler(onRotation: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === KEY_STORAGE_KEY && event.oldValue && !event.newValue) {
      onRotation();
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
