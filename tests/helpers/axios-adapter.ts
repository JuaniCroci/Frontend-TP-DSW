import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

export function response(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 204 ? 'No Content' : status === 201 ? 'Created' : 'OK',
    headers: new AxiosHeaders(),
    config,
  };
}

export function requestBody(data: unknown): unknown {
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export function hang(): Promise<never> {
  return new Promise<never>(() => {});
}
