import crypto from 'crypto';
import { logError, logInfo } from '../utils/logger';
import { EncryptionResult } from '../types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    const errorMessage = 'ENCRYPTION_KEY is not set in environment variables';
    logError('EncryptionService', errorMessage);
    throw new Error(errorMessage);
  }

  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== KEY_LENGTH) {
    const errorMessage = `Encryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`;
    logError('EncryptionService', errorMessage);
    throw new Error(errorMessage);
  }

  return keyBuffer;
};

const encryptionKey = getEncryptionKey();

export const encrypt = (plaintext: string): EncryptionResult => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    logInfo('EncryptionService', 'Data encrypted successfully');

    return {
      encryptedContent: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('EncryptionService', `Encryption failed: ${errorMessage}`);
    throw new Error('Failed to encrypt data');
  }
};

export const decrypt = (encryptedContent: string, ivHex: string, authTagHex: string): string => {
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    logInfo('EncryptionService', 'Data decrypted successfully');

    return decrypted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('EncryptionService', `Decryption failed: ${errorMessage}`);
    throw new Error('Failed to decrypt data - data may be corrupted or tampered');
  }
};

export const generateEncryptionKey = (): string => {
  const key = crypto.randomBytes(32);
  return key.toString('hex');
};

export default {
  encrypt,
  decrypt,
  generateEncryptionKey
};
