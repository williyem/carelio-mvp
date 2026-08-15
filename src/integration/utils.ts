import { AxiosError, AxiosResponse } from 'axios';
import type { ApiErrorResponse, ApiResponse } from './config';

export const getErrorMessage = (
  error: unknown,
  defaultMessage = 'An error occurred'
): string => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as
      | (ApiErrorResponse & { details?: { message?: string } })
      | undefined;

    // Check for nested details.message first (most specific error)
    if (errorData?.details?.message) {
      return errorData.details.message;
    }

    // Check for top-level message
    if (errorData?.message) {
      return errorData.message;
    }

    // Check for top-level error
    if (errorData?.error) {
      return errorData.error;
    }

    // Fall back to axios error message
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};

export const getValidationErrors = (
  error: unknown
): Record<string, string[]> | null => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ApiErrorResponse | undefined;
    return errorData?.errors || null;
  }
  return null;
};

export const isSuccessResponse = <T>(
  response: AxiosResponse<ApiResponse<T>>
): boolean => {
  return response.status >= 200 && response.status < 300;
};

export const extractResponseData = <T>(
  response: AxiosResponse<ApiResponse<T> | T>
): T => {
  if (
    typeof response.data === 'object' &&
    response.data !== null &&
    'data' in response.data
  ) {
    return (response.data as ApiResponse<T>).data;
  }
  return response.data as T;
};

export const isAxiosError = (error: unknown): error is AxiosError => {
  return error instanceof AxiosError;
};

export const isForbiddenError = (error: unknown): boolean => {
  return isAxiosError(error) && error.response?.status === 403;
};

export const isApiErrorResponse = (
  error: unknown
): error is AxiosError<ApiErrorResponse> => {
  return isAxiosError(error) && error.response !== undefined;
};

export const safeApiCall = async <T>(
  apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const response = await apiCall();
    return {
      data: extractResponseData(response),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
};
