import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_TOKEN = 'scan_accessToken';
const STORAGE_EXPIRE = 'scan_expire';

const AuthContext = createContext(null);

function parseExpire(value) {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function isExpireValid(expireMs) {
  return expireMs && expireMs > Date.now();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [expire, setExpire] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    const storedExpire = parseExpire(localStorage.getItem(STORAGE_EXPIRE));

    if (storedToken && isExpireValid(storedExpire)) {
      setToken(storedToken);
      setExpire(storedExpire);
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_EXPIRE);
    }
  }, []);

  const login = useCallback((accessToken, expireIso) => {
    const expireMs = parseExpire(expireIso);
    setToken(accessToken);
    setExpire(expireMs);
    localStorage.setItem(STORAGE_TOKEN, accessToken);
    localStorage.setItem(STORAGE_EXPIRE, expireIso);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setExpire(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_EXPIRE);
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
      expire,
      isAuthed: Boolean(token) && isExpireValid(expire),
      login,
      logout,
    }),
    [token, expire, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
