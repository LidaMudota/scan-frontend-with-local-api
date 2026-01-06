import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../features/auth/AuthContext';
import { runSearch, loadDocuments, resetSearch } from '../../features/search/searchSlice';
import { isValidInn, normalizeInn } from '../../shared/inn';
import { makeInterval, notInFuture } from '../../shared/dates';
import Loader from '../../components/UI/Loader';
import Carousel from '../../components/UI/Carousel';
import './search.css';

export default function Search() {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const searchState = useSelector((state) => state.search);
  const [form, setForm] = useState({
    inn: '',
    maxFullness: false,
    inBusinessNews: false,
    onlyMainRole: false,
    tonality: 'any',
    onlyWithRiskFactors: false,
    includeTechNews: false,
    includeAnnouncements: false,
    includeDigests: false,
    limit: 10,
    dateStart: '',
    dateEnd: '',
  });
  const [validationError, setValidationError] = useState('');
  const [hasScrolledToResults, setHasScrolledToResults] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => () => dispatch(resetSearch()), [dispatch]);

  const innDigits = normalizeInn(form.inn);
  const hasInnValue = innDigits.length > 0;
  const isInnValid = isValidInn(form.inn);
  const isTonalityValid = Boolean(form.tonality);
  const isLimitValid = Number(form.limit) >= 1 && Number(form.limit) <= 1000;
  const datesValid = useMemo(() => {
    if (!form.dateStart || !form.dateEnd) return false;
    if (!notInFuture(form.dateStart) || !notInFuture(form.dateEnd)) return false;
    return new Date(form.dateStart) <= new Date(form.dateEnd);
  }, [form.dateStart, form.dateEnd]);

  useEffect(() => {
    if (hasInnValue && !isInnValid) {
      setValidationError('Введите корректный ИНН (10 или 12 цифр с проверкой).');
    } else if (!datesValid) {
      setValidationError('Проверьте даты: не в будущем и начало не позже конца.');
    } else if (!isLimitValid) {
      setValidationError('Лимит должен быть от 1 до 1000.');
    } else if (!isTonalityValid) {
      setValidationError('Выберите тональность.');
    } else {
      setValidationError('');
    }
  }, [hasInnValue, isInnValid, datesValid, isLimitValid, isTonalityValid]);

  const disabled =
    !hasInnValue || !isInnValid || !datesValid || !isLimitValid || !isTonalityValid || searchState.histogramsLoading;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => {
    const { startDate, endDate } = makeInterval(form.dateStart, form.dateEnd);
    return {
      issueDateInterval: { startDate, endDate },
      searchContext: {
        targetSearchEntitiesContext: {
          targetSearchEntities: [
            {
              type: 'company',
              inn: Number(innDigits),
              maxFullness: Boolean(form.maxFullness),
              inBusinessNews: form.inBusinessNews ? true : null,
            },
          ],
        },
      },
      onlyMainRole: form.onlyMainRole,
      tonality: form.tonality,
      onlyWithRiskFactors: form.onlyWithRiskFactors,
      attributeFilters: {
        excludeTechNews: !form.includeTechNews,
        excludeAnnouncements: !form.includeAnnouncements,
        excludeDigests: !form.includeDigests,
      },
      intervalType: 'month',
      histogramTypes: ['totalDocuments', 'riskFactors'],
      similarMode: 'duplicates',
      sortType: 'issueDate',
      sortDirectionType: 'desc',
      limit: Number(form.limit),
    };
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    const payload = buildPayload();
    setHasScrolledToResults(false);
    dispatch(runSearch({ payload, token }));
  };

  useEffect(() => {
    if (searchState.ids.length > 0 && searchState.docs.length === 0 && !searchState.docsLoading) {
      dispatch(loadDocuments({ token }));
    }
  }, [dispatch, token, searchState.ids.length, searchState.docs.length, searchState.docsLoading]);

  const canLoadMore = searchState.loadedCount < searchState.ids.length;
  const resultsTotal = searchState.ids.length;
  const resultsShown = searchState.loadedCount || searchState.docs.length;

  const histogramRows = useMemo(() => {
    const totals = searchState.histograms.find((h) => h.histogramType === 'totalDocuments')?.data || [];
    const risks = searchState.histograms.find((h) => h.histogramType === 'riskFactors')?.data || [];
    const map = new Map();
    totals.forEach((item) => {
      map.set(item.date, { date: item.date, total: item.value, risk: 0 });
    });
    risks.forEach((item) => {
      const existing = map.get(item.date) || { date: item.date, total: 0, risk: 0 };
      existing.risk = item.value;
      map.set(item.date, existing);
    });
    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [searchState.histograms]);

  const renderDocs = () => {
    return searchState.docs.map((doc, idx) => {
      if (doc.fail) {
        return (
          <div className="card" key={doc.fail?.errorCode || idx}>
            <div className="error">Ошибка: {doc.fail.errorMessage || 'Документ не найден'}</div>
          </div>
        );
      }
      const item = doc.ok;
      if (!item) return null;
      const date = new Date(item.issueDate);
      const formatted = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
      return (
        <article className="card doc-card" key={item.id}>
          <div className="doc-card__meta">
            <span>{formatted}</span>
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.source?.name || 'Источник'}
            </a>
          </div>
          <h3>{item.title?.text}</h3>
          <div className="tags">
            {item.attributes?.isTechNews && <span className="badge">технические новости</span>}
            {item.attributes?.isAnnouncement && <span className="badge">анонсы и события</span>}
            {item.attributes?.isDigest && <span className="badge">сводки новостей</span>}
          </div>
          <div className="doc-card__content" dangerouslySetInnerHTML={{ __html: item.content?.markup }} />
          <div className="doc-card__actions">
            <a className="btn" href={item.url} target="_blank" rel="noreferrer">
              Читать в источнике
            </a>
            <span className="text-muted">{item.attributes?.wordCount || 0} слов</span>
          </div>
        </article>
      );
    });
  };

  useEffect(() => {
    if (!resultsRef.current) return;
    const hasResults = searchState.ids.length > 0 || searchState.docs.length > 0;
    const summaryReady = !searchState.histogramsLoading && histogramRows.length > 0;
    const docsReady = searchState.docs.length > 0;

    if (hasResults && (summaryReady || docsReady) && !hasScrolledToResults) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHasScrolledToResults(true);
    }
  }, [hasScrolledToResults, histogramRows.length, searchState.docs.length, searchState.histogramsLoading, searchState.ids.length]);

  return (
    <div className="search-page">
      <h1>Поиск публикаций</h1>
      <div className="search-grid">
        <form className="card search-form" onSubmit={onSubmit}>
          <div className="field">
            <label>ИНН компании *</label>
            <input value={form.inn} onChange={(e) => handleChange('inn', e.target.value)} />
            {!isInnValid && form.inn && <span className="error">Невалидный ИНН</span>}
          </div>
          <div className="field">
            <label>Тональность *</label>
            <select value={form.tonality} onChange={(e) => handleChange('tonality', e.target.value)}>
              <option value="positive">Позитивная</option>
              <option value="negative">Негативная</option>
              <option value="any">Любая</option>
            </select>
          </div>
          <div className="field">
            <label>Лимит документов *</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={form.limit}
              onChange={(e) => handleChange('limit', e.target.value)}
            />
          </div>
          <div className="date-row">
            <div className="field">
              <label>Дата начала *</label>
              <input
                type="date"
                value={form.dateStart}
                onChange={(e) => handleChange('dateStart', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Дата конца *</label>
              <input type="date" value={form.dateEnd} onChange={(e) => handleChange('dateEnd', e.target.value)} />
            </div>
          </div>
          <div className="checkbox-grid">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.maxFullness}
                onChange={(e) => handleChange('maxFullness', e.target.checked)}
              />
              Максимальная полнота
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.inBusinessNews}
                onChange={(e) => handleChange('inBusinessNews', e.target.checked)}
              />
              Упоминания в бизнес-контексте
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.onlyMainRole}
                onChange={(e) => handleChange('onlyMainRole', e.target.checked)}
              />
              Главная роль в публикации
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.onlyWithRiskFactors}
                onChange={(e) => handleChange('onlyWithRiskFactors', e.target.checked)}
              />
              Только с факторами риска
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.includeTechNews}
                onChange={(e) => handleChange('includeTechNews', e.target.checked)}
              />
              Включать технические новости рынков
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.includeAnnouncements}
                onChange={(e) => handleChange('includeAnnouncements', e.target.checked)}
              />
              Включать анонсы и календари
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.includeDigests}
                onChange={(e) => handleChange('includeDigests', e.target.checked)}
              />
              Включать сводки новостей
            </label>
          </div>
          {validationError && <div className="error">{validationError}</div>}
          <button className="btn primary" type="submit" disabled={disabled}>
            {searchState.histogramsLoading ? 'Ищем...' : 'Поиск'}
          </button>
        </form>

        <div className="card results-card">
          <h2>Сводка</h2>
          {searchState.histogramsLoading && <Loader />}
          {searchState.histogramsError && <div className="error">{searchState.histogramsError}</div>}
          {!searchState.histogramsLoading && histogramRows.length > 0 && (
            <div className="summary-scroll">
              <Carousel itemsPerView={4}>
                {histogramRows.map((row) => (
                  <div className="summary-item card" key={row.date}>
                    <div className="text-muted">{new Date(row.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</div>
                    <div>Всего: {row.total}</div>
                    <div>Риски: {row.risk}</div>
                  </div>
                ))}
              </Carousel>
            </div>
          )}
        </div>
      </div>

      <section className="results-section" ref={resultsRef}>
        <div className="results-header">
          <h2>Результаты поиска</h2>
          {resultsTotal > 0 && (
            <p className="results-subtitle">Показаны первые {Math.min(resultsShown, resultsTotal)} из {resultsTotal}</p>
          )}
        </div>

        <div className="cards-grid">
          {searchState.docsLoading && searchState.docs.length === 0 && (
            <div className="skeleton-list">
              {[...Array(4)].map((_, idx) => (
                <div className="card doc-skeleton" key={idx}>
                  <div className="skeleton skeleton--meta" />
                  <div className="skeleton skeleton--title" />
                  <div className="skeleton skeleton--text" />
                  <div className="skeleton skeleton--text" />
                  <div className="skeleton skeleton--footer" />
                </div>
              ))}
            </div>
          )}

          {!searchState.docsLoading && resultsTotal === 0 && !searchState.histogramsLoading && !searchState.histogramsError && (
            <div className="empty-state card">
              <h3>Ничего не найдено</h3>
              <p className="text-muted">Попробуйте изменить параметры запроса или проверить корректность ИНН.</p>
            </div>
          )}

          {renderDocs()}
          {searchState.docsLoading && searchState.docs.length > 0 && (
            <div className="inline-loader">
              <Loader />
            </div>
          )}
          {searchState.docsError && <div className="error">{searchState.docsError}</div>}
        </div>

        {canLoadMore && (
          <div className="load-more">
            <button className="btn primary" onClick={() => dispatch(loadDocuments({ token }))} disabled={searchState.docsLoading}>
              {searchState.docsLoading ? 'Загрузка...' : 'Показать больше'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
