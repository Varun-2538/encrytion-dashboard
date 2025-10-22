import axios, { AxiosError } from 'axios';
import { supabase } from './supabase';
import type {
  Secret,
  ApiResponse,
  CreateSecretRequest,
  UpdateSecretRequest
} from '@/types';

/**
 * API client for backend communication
 * Handles authentication and request/response formatting
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Creates an axios instance with authentication headers
 * @returns Axios instance configured with auth token
 */
const getAuthenticatedClient = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }

  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    }
  });
};

/**
 * Handles API errors and formats them consistently
 * @param error - Axios error object
 * @returns Formatted error message
 */
const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>;

    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      if ('error' in data) {
        return data.error;
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Fetches all secrets for the authenticated user
 * @returns Array of secrets
 * @throws Error if request fails
 */
export const fetchSecrets = async (): Promise<Secret[]> => {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<ApiResponse<Secret[]>>('/api/secrets');

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('error' in response.data ? response.data.error : 'Failed to fetch secrets');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Creates a new secret
 * @param request - Secret content
 * @returns Created secret
 * @throws Error if request fails
 */
export const createSecret = async (request: CreateSecretRequest): Promise<Secret> => {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.post<ApiResponse<Secret>>('/api/secrets', request);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('error' in response.data ? response.data.error : 'Failed to create secret');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Updates an existing secret
 * @param id - Secret ID
 * @param request - Updated secret content
 * @returns Updated secret
 * @throws Error if request fails
 */
export const updateSecret = async (
  id: string,
  request: UpdateSecretRequest
): Promise<Secret> => {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.put<ApiResponse<Secret>>(`/api/secrets/${id}`, request);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('error' in response.data ? response.data.error : 'Failed to update secret');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Deletes a secret
 * @param id - Secret ID
 * @throws Error if request fails
 */
export const deleteSecret = async (id: string): Promise<void> => {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.delete<ApiResponse<null>>(`/api/secrets/${id}`);

    if (!response.data.success) {
      throw new Error('error' in response.data ? response.data.error : 'Failed to delete secret');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
