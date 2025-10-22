import crypto from 'crypto';
import { logError, logInfo } from '../utils/logger';
import { EncryptionResult } from '../types';

/**
 * Encryption service for securing sensitive data using AES-256-GCM
 * Provides encryption and decryption functionality with authenticated encryption
 */
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly keyLength = 32; // 256 bits
  private readonly encryptionKey: Buffer;

  constructor() {
    this.encryptionKey = this.getEncryptionKey();
  }

  /**
   * Retrieves and validates the encryption key from environment variables
   */
  private getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
      const errorMessage = 'ENCRYPTION_KEY is not set in environment variables';
      logError('EncryptionService', errorMessage);
      throw new Error(errorMessage);
    }

    // Convert hex string to buffer
    const keyBuffer = Buffer.from(key, 'hex');

    if (keyBuffer.length !== this.keyLength) {
      const errorMessage = `Encryption key must be ${this.keyLength} bytes (${this.keyLength * 2} hex characters)`;
      logError('EncryptionService', errorMessage);
      throw new Error(errorMessage);
    }

    return keyBuffer;
  }

  /**
   * Encrypts plaintext data using AES-256-GCM
   */
  public encrypt(plaintext: string): EncryptionResult {
    try {
      // Generate random initialization vector
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
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
  }

  /**
   * Decrypts encrypted data using AES-256-GCM
   */
  public decrypt(encryptedContent: string, ivHex: string, authTagHex: string): string {
    try {
      // Convert hex strings to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

      // Set authentication tag
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      logInfo('EncryptionService', 'Data decrypted successfully');

      return decrypted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('EncryptionService', `Decryption failed: ${errorMessage}`);
      throw new Error('Failed to decrypt data - data may be corrupted or tampered');
    }
  }

  /**
   * Generates a random encryption key for initial setup
   * This should only be used once during initial configuration
   */
  public static generateEncryptionKey(): string {
    const key = crypto.randomBytes(32);
    return key.toString('hex');
  }
}

// Export singleton instance
export default new EncryptionService();
