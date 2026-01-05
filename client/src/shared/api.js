const API_PREFIX = '/api/v1';
const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://localhost:4000${API_PREFIX}`;

function buildApiUrl(path = '') {
  const baseWithoutTrailingSlash = (API_BASE || '').replace(/\/+$/, '');
  const baseWithPrefix = baseWithoutTrailingSlash.endsWith(API_PREFIX)
    ? baseWithoutTrailingSlash
    : `${baseWithoutTrailingSlash}${API_PREFIX}`;
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(normalizedPath, `${baseWithPrefix}/`);
  return url.toString();
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = buildApiUrl(path);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('API недоступен');
    }
    throw error;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || 'Ошибка запроса';
    throw new Error(message);
  }
  return data;
}

export function loginRequest(credentials) {
  return request('/account/login', { method: 'POST', body: credentials });
}

export function registerRequest(body) {
  return request('/account/register', { method: 'POST', body });
}

export function accountInfoRequest(token) {
  return request('/account/info', { token });
}

export function histogramsRequest(body, token) {
  return request('/objectsearch/histograms', { method: 'POST', body, token });
}

export function objectSearchRequest(body, token) {
  return request('/objectsearch', { method: 'POST', body, token });
}

export function documentsRequest(ids, token) {
  return request('/documents', { method: 'POST', body: { ids }, token });
}
