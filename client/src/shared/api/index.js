import { endpoints } from './endpoints';
import { get, post } from './http';

export function loginRequest(credentials) {
  return post(endpoints.login, credentials);
}

export function registerRequest(body) {
  return post(endpoints.register, body);
}

export function accountInfoRequest(token) {
  return get(endpoints.accountInfo, token);
}

export function histogramsRequest(body, token) {
  return post(endpoints.histograms, body, token);
}

export function objectSearchRequest(body, token) {
  return post(endpoints.objectSearch, body, token);
}

export function documentsRequest(ids, token) {
  return post(endpoints.documents, { ids }, token);
}

export * from './types';
export * from './http';
export * from './endpoints';
