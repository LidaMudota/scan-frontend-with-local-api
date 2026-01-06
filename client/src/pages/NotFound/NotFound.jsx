import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui';
import './notfound.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="notfound card">
      <h1>Страница не найдена</h1>
      <p className="text-muted">
        Маршрут не существует или недоступен. Проверьте адрес или вернитесь на главную.
      </p>
      <div className="notfound__actions">
        <Button variant="primary" onClick={() => navigate('/')}>
          На главную
        </Button>
        <Link to="/search" className="btn">
          В поиск
        </Link>
      </div>
    </div>
  );
}
