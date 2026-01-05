import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_TOKEN = 'scan_accessToken';
const STORAGE_EXPIRE = 'scan_expire';
const STORAGE_LOGIN = 'scan_login';

const AuthContext = createContext(null);

function parseExpire(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const stringValue = String(value).trim();
  const numeric = Number(stringValue);
  if (Number.isFinite(numeric) && stringValue.match(/^\d+$/)) {
    return numeric;
  }
  const parsed = Date.parse(stringValue);
  return Number.isNaN(parsed) ? null : parsed;
}

function isExpireValid(expireMs) {
  return expireMs && expireMs > Date.now();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [expire, setExpire] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    const storedExpire = parseExpire(localStorage.getItem(STORAGE_EXPIRE));
    const storedLogin = localStorage.getItem(STORAGE_LOGIN);

    if (storedToken && isExpireValid(storedExpire)) {
      setToken(storedToken);
      setExpire(storedExpire);
      setUser(storedLogin ? { login: storedLogin } : null);
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_EXPIRE);
      localStorage.removeItem(STORAGE_LOGIN);
    }
  }, []);

  const login = useCallback(({ accessToken, expire: expireIso, expireMs, login: loginName }) => {
    const parsedExpire = parseExpire(expireMs ?? expireIso);
    setToken(accessToken);
    setExpire(parsedExpire);
    setUser(loginName ? { login: loginName } : null);
    localStorage.setItem(STORAGE_TOKEN, accessToken);
    if (parsedExpire) {
      localStorage.setItem(STORAGE_EXPIRE, String(parsedExpire));
    } else {
      localStorage.removeItem(STORAGE_EXPIRE);
    }
    if (loginName) {
      localStorage.setItem(STORAGE_LOGIN, loginName);
    } else {
      localStorage.removeItem(STORAGE_LOGIN);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setExpire(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_EXPIRE);
    localStorage.removeItem(STORAGE_LOGIN);
  }, []);

  useEffect(() => {
    if (!token || !expire) return;
    if (!isExpireValid(expire)) {
      logout();
    }
  }, [token, expire, logout]);

  const value = useMemo(
    () => ({
      token,
      accessToken: token,
      expire,
      user,
      isAuth: Boolean(token) && isExpireValid(expire),
      login,
      logout,
    }),
    [token, expire, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
