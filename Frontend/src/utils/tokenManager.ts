import api from '@/api/apiService';

// Storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USERNAME_KEY = 'username';

// === GETTERS ===
export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getUsername = (): string | null => localStorage.getItem(USERNAME_KEY);

// === SETTERS ===
export const setTokens = (access: string, refresh: string, username: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  localStorage.setItem(USERNAME_KEY, username);
  setAuthHeader(access);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  clearAuthHeader();
};

// === AUTH HEADER ===
export const setAuthHeader = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthHeader = (): void => {
  delete api.defaults.headers.common['Authorization'];
};
