import { AxiosResponse } from 'axios';
import { apiClient } from '@/integration/config';
import { HEALTH_ASSISTANT_ENDPOINTS } from './endpoints';
import type {
  HealthAssistantRegisterRequest,
  HealthAssistantLoginRequest,
  HealthAssistantLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetSessionResponse,
  LogoutResponse,
} from './types';

/**
 * Register a new health assistant
 */
export const registerHealthAssistant = async (
  data: HealthAssistantRegisterRequest
): Promise<AxiosResponse<HealthAssistantLoginResponse>> => {
  return apiClient.post<HealthAssistantLoginResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.REGISTER,
    data
  );
};

/**
 * Login health assistant
 */
export const loginHealthAssistant = async (
  data: HealthAssistantLoginRequest
): Promise<AxiosResponse<HealthAssistantLoginResponse>> => {
  return apiClient.post<HealthAssistantLoginResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.LOGIN,
    data
  );
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<AxiosResponse<RefreshTokenResponse>> => {
  return apiClient.post<RefreshTokenResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.REFRESH_TOKEN,
    data
  );
};

/**
 * Logout health assistant
 */
export const logoutHealthAssistant = async (): Promise<
  AxiosResponse<LogoutResponse>
> => {
  return apiClient.post<LogoutResponse>(HEALTH_ASSISTANT_ENDPOINTS.LOGOUT);
};

/**
 * Get current session
 */
export const getSession = async (): Promise<
  AxiosResponse<GetSessionResponse>
> => {
  return apiClient.get<GetSessionResponse>(HEALTH_ASSISTANT_ENDPOINTS.SESSION);
};
