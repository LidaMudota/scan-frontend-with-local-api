const defaultConfig = {
  apiBaseUrl: 'http://localhost:4000',
  apiPrefix: '/api/v1',
  appName: 'ScanCorp',
};

function normalizePath(path) {
  if (!path) return '';
  return `/${String(path).replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

function readEnvValue(key, fallback) {
  const value = import.meta.env?.[key];
  if (value === undefined || value === null || value === '') return fallback;
  return value;
}

export function loadConfig() {
  const apiBaseUrl = readEnvValue('VITE_API_BASE_URL', defaultConfig.apiBaseUrl);
  const apiPrefix = normalizePath(readEnvValue('VITE_API_PREFIX', defaultConfig.apiPrefix));
  const appName = readEnvValue('VITE_APP_NAME', defaultConfig.appName);

  return {
    apiBaseUrl,
    apiPrefix,
    appName,
  };
}

export const appConfig = loadConfig();
