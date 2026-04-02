import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  salt: string;
}

export function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

export function encrypt(plaintext: string, userKey: string): EncryptedData {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(userKey, salt);
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt: salt.toString('base64'),
  };
}

export function decrypt(encrypted: EncryptedData, userKey: string): string {
  const salt = Buffer.from(encrypted.salt, 'base64');
  const key = deriveKey(userKey, salt);
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let plaintext = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');
  
  return plaintext;
}

export function generateUserKey(): string {
  return randomBytes(32).toString('base64');
}

export function hashForComparison(data: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(data, salt, KEY_LENGTH);
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

export function verifyHash(data: string, storedHash: string): boolean {
  const [saltB64, hashB64] = storedHash.split(':');
  const salt = Buffer.from(saltB64, 'base64');
  const hash = scryptSync(data, salt, KEY_LENGTH);
  return hash.toString('base64') === hashB64;
}
