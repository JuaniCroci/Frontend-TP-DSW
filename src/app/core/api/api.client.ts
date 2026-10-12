import axios from 'axios';
import { clearSession, getToken } from '../auth/session';
import { toApiError } from './apiError';

export { TOKEN_KEY } from '../auth/session';

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

export function apiAssetUrl(path: string): string {
  return apiClient.getUri({ url: path });
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : '';
    if (apiError.statusCode === 401 && !url.includes('/api/auth/') && getToken()) {
      clearSession();
      window.dispatchEvent(new Event('auth:session-expired'));
    }
    return Promise.reject(apiError);
  },
);
