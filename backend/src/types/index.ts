import { Request } from 'express';

/**
 * Type definitions for the backend application
 */

/**
 * Authenticated user information attached to request
 */
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Secret database record structure
 */
export interface SecretRecord {
  id: string;
  user_id: string;
  name: string;
  encrypted_content: string;
  iv: string;
  auth_tag: string;
  created_at: string;
  updated_at: string;
}

/**
 * Secret response structure (decrypted)
 */
export interface SecretResponse {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Encryption result structure
 */
export interface EncryptionResult {
  encryptedContent: string;
  iv: string;
  authTag: string;
}

/**
 * API success response structure
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Combined API response type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Environment variables type
 */
export interface EnvironmentVariables {
  PORT: string;
  NODE_ENV: string;
  FRONTEND_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ENCRYPTION_KEY: string;
}

/**
 * Log levels
 */
export type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
