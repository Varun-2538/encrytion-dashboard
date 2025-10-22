/**
 * Type definitions for the Secrets Store application
 */

/**
 * Secret interface representing a stored secret
 */
export interface Secret {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User interface representing an authenticated user
 */
export interface User {
  id: string;
  email: string;
  role?: string;
}

/**
 * API response wrapper for successful responses
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API response wrapper for error responses
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
 * Create secret request payload
 */
export interface CreateSecretRequest {
  name: string;
  content: string;
}

/**
 * Update secret request payload
 */
export interface UpdateSecretRequest {
  name: string;
  content: string;
}

/**
 * Modal state for Add/Edit operations
 */
export interface SecretModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  secret?: Secret;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}
