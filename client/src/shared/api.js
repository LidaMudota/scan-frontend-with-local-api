const API_PREFIX = '/api/v1';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function normalizeUrlJoin(base, path = '') {
  const trimmedBase = (base || '').replace(/\/+$/, '');
  const baseWithPrefix = trimmedBase.includes(API_PREFIX)
    ? trimmedBase
    : `${trimmedBase}${API_PREFIX}`;
  const normalizedPath = `/${String(path || '').replace(/^\/+/, '')}`;
  const [protocol, rest] = baseWithPrefix.split('://');
  const combined = `${rest || baseWithPrefix}${normalizedPath}`;
  const normalizedRest = combined.replace(/\/{2,}/g, '/');
  return protocol ? `${protocol}://${normalizedRest}` : normalizedRest;
}

function toApiUrl(path = '') {
  return normalizeUrlJoin(API_BASE, path);
}

async function request(method, path, body, token) {
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

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || 'Ошибка запроса';
    const requestError = new Error(message);
    requestError.status = response.status;
    requestError.body = data;
    throw requestError;
  }
  return data;
}

export function loginRequest(credentials) {
  return request('POST', '/account/login', credentials);
}

export function registerRequest(body) {
  return request('POST', '/account/register', body);
}

export function accountInfoRequest(token) {
  return request('GET', '/account/info', undefined, token);
}

export function histogramsRequest(body, token) {
  return request('POST', '/objectsearch/histograms', body, token);
}

export function objectSearchRequest(body, token) {
  return request('POST', '/objectsearch', body, token);
}

export function documentsRequest(ids, token) {
  return request('POST', '/documents', { ids }, token);
}
