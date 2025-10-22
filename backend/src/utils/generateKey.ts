#!/usr/bin/env node

/**
 * Encryption Key Generator
 * Generates a secure 256-bit (32-byte) encryption key for AES-256-GCM
 *
 * Usage: ts-node src/utils/generateKey.ts
 */

import crypto from 'crypto';

console.log('\n===========================================');
console.log('  Encryption Key Generator');
console.log('===========================================\n');

// Generate a random 32-byte (256-bit) key
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('Your new encryption key (copy this to your .env file):\n');
console.log('\x1b[32m%s\x1b[0m', encryptionKey);
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('  1. Keep this key SECRET - never commit it to version control');
console.log('  2. Store it securely - if lost, all encrypted data is unrecoverable');
console.log('  3. Never change this key after encrypting data');
console.log('  4. Backup this key in a secure password manager');
console.log('\nAdd this to your backend/.env file as:');
console.log('\x1b[33m%s\x1b[0m', `ENCRYPTION_KEY=${encryptionKey}`);
console.log('\n===========================================\n');
