const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

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
