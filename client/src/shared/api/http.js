import { appConfig } from '../config';

const API_PREFIX = appConfig.apiPrefix || '/api/v1';

function normalizeUrlJoin(base, path = '') {
  const trimmedBase = (base || '').replace(/\/+$/, '');
  const normalizedPath = `/${String(path || '').replace(/^\/+/, '')}`;
  const baseWithPrefix = trimmedBase.includes(API_PREFIX) ? trimmedBase : `${trimmedBase}${API_PREFIX}`;
  const [protocol, rest] = baseWithPrefix.split('://');
  const combined = `${rest || baseWithPrefix}${normalizedPath}`;
  const normalizedRest = combined.replace(/\/{2,}/g, '/');
  return protocol ? `${protocol}://${normalizedRest}` : normalizedRest;
}

function toApiUrl(path = '') {
  return normalizeUrlJoin(appConfig.apiBaseUrl, path);
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch (_err) {
    return null;
  }
}

export async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = toApiUrl(path);
  if (import.meta.env.DEV) {
    console.debug('[api]', method, url);
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const networkError = new Error('API недоступен');
    networkError.status = 0;
    throw networkError;
  }

  const data = await parseJson(response);
  if (!response.ok) {
    const message = data?.message || 'Ошибка запроса';
    const requestError = new Error(message);
    requestError.status = response.status;
    requestError.body = data;
    throw requestError;
  }
  return data;
}

export function get(path, token) {
  return request('GET', path, undefined, token);
}

export function post(path, body, token) {
  return request('POST', path, body, token);
}

export const apiUrls = {
  normalizeUrlJoin,
  toApiUrl,
};
