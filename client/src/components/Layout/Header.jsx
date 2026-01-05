import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { fetchAccountInfo, clearAccount } from '../../features/account/accountSlice';
import Loader from '../UI/Loader';
import './layout.css';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, isAuth, user, logout } = useAuth();
  const { data, loading } = useSelector((state) => state.account);

  useEffect(() => {
    if (isAuth && token) {
      dispatch(fetchAccountInfo(token));
    }
  }, [dispatch, token, isAuth]);

  const onLogout = () => {
    logout();
    dispatch(clearAccount());
    navigate('/');
  };

  const displayName = data?.user?.name || user?.login || 'Пользователь';
  const initials = displayName?.slice(0, 2)?.toUpperCase() || 'AU';

  return (
    <header className="header">
      <div className="logo">ScanCorp</div>
      <nav className="nav">
        <Link to="#">Тарифы</Link>
        <Link to="#">FAQ</Link>
      </nav>
      {!isAuth && (
        <div className="actions">
          <button className="btn" onClick={() => navigate('/register')}>Зарегистрироваться</button>
          <button className="btn primary" onClick={() => navigate('/login')}>
            Войти
          </button>
        </div>
      )}
      {isAuth && (
        <div className="actions">
          <div className="limit-panel" aria-live="polite">
            {loading && <Loader />}
            {!loading && (
              <>
                <div className="limit-panel__item">
                  <span>Использовано компаний</span>
                  <span className="limit-panel__value">{data?.eventFiltersInfo?.usedCompanyCount ?? '-'} </span>
                </div>
                <div className="limit-panel__item">
                  <span>Лимит по компаниям</span>
                  <span className="limit-panel__value">{data?.eventFiltersInfo?.companyLimit ?? '-'}</span>
                </div>
              </>
            )}
          </div>
          <div className="user-box">
            <div className="avatar" aria-hidden>
              {initials}
            </div>
            <div>
              <div>{displayName}</div>
              <button className="btn" onClick={onLogout}>
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
