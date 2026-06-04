import axios, { type InternalAxiosRequestConfig } from 'axios';

export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5050';
const envApiUrl = import.meta.env.VITE_API_URL;
const localApiUrl = 'http://localhost:5050/api';
const defaultApiUrl = `${BASE_URL}/api`;

const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const apiBaseURL = isLocalHost ? localApiUrl : (envApiUrl ?? defaultApiUrl);

const api = axios.create({
  baseURL: apiBaseURL,
});

// Interceptor: Menyisipkan Token JWT otomatis ke setiap request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || error.message || 'Terjadi kesalahan pada sistem.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan pada sistem.';
};

export default api;