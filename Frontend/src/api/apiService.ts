// src/api/apiService.ts
import axios, { InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import { toast } from 'sonner';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../utils/tokenManager';

const serverUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach access token automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry limit map
const retryCounts: Record<string, number> = {};
const MAX_RETRIES = 1;

// ✅ Refresh token manually on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const key = originalRequest.url || 'unknown';
    retryCounts[key] = retryCounts[key] ?? 0;

    if (error.response?.status === 401 && retryCounts[key] < MAX_RETRIES) {
      retryCounts[key]++;
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${serverUrl}/api/token/refresh/`,
          { refresh: getRefreshToken() },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access, refresh } = data;
        setTokens(access, refresh, '');

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch {
        toast.error('Session expired. Please log in again.');
        clearTokens();
        window.location.href = '/login';
      }
    }

    if (error.response?.status !== 401) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }

    return Promise.reject(error);
  }
);

export default api;
