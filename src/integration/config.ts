import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { isDummyDataEnabled } from '@/lib/dummy-data/config';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export const API_ROUTE_BASE = '/api';

export const USE_DUMMY_DATA = isDummyDataEnabled();

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode?: number;
}

export const authApiClient: AxiosInstance = axios.create({
  baseURL: USE_DUMMY_DATA ? API_ROUTE_BASE : API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_ROUTE_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      // if (status === 401 || status === 402) {
      //   if (typeof window !== 'undefined') {
      //     localStorage.clear();
      //     window.location.href = '/';
      //   }
      // }

      if (status === 403) {
        console.error('Forbidden access');
      }

      if (status >= 500) {
        console.error(
          'Server error:',
          data?.message || 'Internal server error'
        );
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export const backendApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const createBackendApiClient = (
  config?: AxiosRequestConfig
): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
    timeout: 30000,
    ...config,
  });
};
