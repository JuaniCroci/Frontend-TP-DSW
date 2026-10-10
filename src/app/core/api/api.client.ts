import axios from 'axios';
import { toApiError } from './apiError';

export const TOKEN_KEY = 'entreno_token';

export function requireBaseUrl(value: string | undefined): string {
  if (!value) {
    throw new Error(
      'Falta VITE_API_URL: creá .env desde .env.example (debe apuntar a la API, ej. http://localhost:3000)',
    );
  }
  return value;
}

export const apiClient = axios.create({
  baseURL: requireBaseUrl(import.meta.env.VITE_API_URL),
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);
