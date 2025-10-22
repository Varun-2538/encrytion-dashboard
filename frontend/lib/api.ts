import axios, { AxiosError } from 'axios';
import { supabase } from './supabase';
import type {
  Secret,
  ApiResponse,
  CreateSecretRequest,
  UpdateSecretRequest
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAuthenticatedClient = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }

  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });
};

const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown> | string>;

    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      if (typeof data === 'string') {
        if (data.includes('<!DOCTYPE html>')) {
          return 'Backend connection error. Please check if the API server is running.';
        }
        return data;
      }

      if (typeof data === 'object' && data !== null && 'error' in data) {
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
