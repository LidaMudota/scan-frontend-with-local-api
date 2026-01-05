import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginRequest } from '../../shared/api';
import { useAuth } from '../../features/auth/AuthContext';
import { fetchAccountInfo } from '../../features/account/accountSlice';
import './login.css';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { login: authLogin } = useAuth();

  const registeredNotice = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('registered') === '1';
  }, [location.search]);

  const disabled = !login || !password || loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest({ login, password });
      authLogin({ accessToken: data.accessToken, expire: data.expire, login });
      dispatch(fetchAccountInfo(data.accessToken));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Войти в систему</h1>
      <div className="login-card card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="login">Логин</label>
            <input id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn primary" disabled={disabled}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
          {registeredNotice && <div className="notice">Аккаунт создан. Теперь войдите.</div>}
          {error && <div className="error">{error}</div>}
        </form>
        <div className="login-extra">
          <button className="btn">Войти через Госуслуги</button>
          <button className="btn">Восстановить доступ</button>
        </div>
      </div>
    </div>
  );
}
