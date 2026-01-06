import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerRequest } from '../../shared/api';
import { Button } from '../../shared/ui';
import './register.css';

function isPasswordValid(value) {
  if (!value) return false;
  const hasLength = value.length >= 8;
  const hasDigit = /\d/.test(value);
  const hasLetter = /[a-zA-Z]/.test(value);
  return hasLength && hasDigit && hasLetter;
}

function isNameValid(value) {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 40;
}

export default function Register() {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const disabled = !isNameValid(name) || !login || !isPasswordValid(password) || loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setError('');
    setLoading(true);
    try {
      await registerRequest({ name: name.trim(), login, password });
      navigate('/login?registered=1', { replace: true });
    } catch (err) {
      setError(err.message || 'Не удалось создать аккаунт');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1>Создать аккаунт</h1>
      <div className="register-card card">
        <form onSubmit={handleSubmit} className="register-form">
          <div className="field">
            <label htmlFor="name">Имя</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
            <p className="hint">Минимум 8 символов, 1 буква и 1 цифра.</p>
          </div>
          <Button type="submit" variant="primary" disabled={disabled}>
            {loading ? 'Создаём...' : 'Зарегистрироваться'}
          </Button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
