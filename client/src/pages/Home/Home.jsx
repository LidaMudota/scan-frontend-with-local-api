import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Carousel from '../../components/UI/Carousel';
import { useAuth } from '../../features/auth/AuthContext';
import './home.css';

const whyItems = [
  'Мгновенные сводки по компаниям',
  'Достоверные источники публикаций',
  'Простая интеграция с локальным API',
  'Гибкие фильтры и проверка ИНН',
  'Лёгкая адаптация под любые сценарии',
];

const tariffs = [
  { key: 'beginner', title: 'Beginner', price: 'Для старта', desc: 'Базовые ограничения и всё необходимое.' },
  { key: 'pro', title: 'Pro', price: 'Для роста', desc: 'Расширенные лимиты и гибкость настроек.' },
  { key: 'business', title: 'Business', price: 'Для лидеров', desc: 'Максимальные возможности и поддержка.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const tariffKey = useSelector((state) => state.account.data?.tariff);

  const cards = useMemo(
    () =>
      tariffs.map((tariff) => {
        const isCurrent = tariff.key === tariffKey;
        return (
          <div className={`tariff-card card ${isCurrent ? 'tariff-card--active' : ''}`} key={tariff.key}>
            <div className="tariff-card__head">
              <div>
                <h3>{tariff.title}</h3>
                <p className="text-muted">{tariff.price}</p>
              </div>
              {isCurrent && <span className="badge">Текущий тариф</span>}
            </div>
            <p>{tariff.desc}</p>
            <button className="btn primary" onClick={() => navigate('#')}>
              {isCurrent ? 'Перейти в личный кабинет' : 'Подробнее'}
            </button>
          </div>
        );
      }),
    [tariffKey, navigate]
  );

  return (
    <div className="home">
      <section className="hero card">
        <div>
          <h1>Единое пространство поиска публикаций</h1>
          <p className="text-muted">
            Авторизация, защита маршрутов, валидация запросов и быстрая доставка результатов в одном клиенте.
          </p>
          <div className="hero__actions">
            {isAuthed ? (
              <button className="btn primary" onClick={() => navigate('/search')}>
                Запросить данные
              </button>
            ) : (
              <button className="btn primary" onClick={() => navigate('/login')}>
                Войти и начать
              </button>
            )}
            <button className="btn" onClick={() => navigate('#')}>
              Узнать больше
            </button>
          </div>
        </div>
        <div className="hero__illustration">Аналитика без лишних движений</div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Почему именно мы</h2>
          <p className="text-muted">Карусель покажет ключевые опоры платформы.</p>
        </div>
        <Carousel itemsPerView={3}>
          {whyItems.map((text, idx) => (
            <div className="why-card card" key={idx}>
              <h3>Преимущество {idx + 1}</h3>
              <p>{text}</p>
            </div>
          ))}
        </Carousel>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Наши тарифы</h2>
          <p className="text-muted">Выберите подходящий уровень доступа.</p>
        </div>
        <div className="tariff-grid">{cards}</div>
      </section>
    </div>
  );
}
