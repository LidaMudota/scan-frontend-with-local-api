import './ui.css';

export function Pagination({ total = 0, page = 1, pageSize = 10, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const go = (next) => onChange?.(next);

  const buildPages = () => {
    return Array.from({ length: pages }, (_, idx) => idx + 1).slice(0, 7);
  };

  return (
    <div className="pagination" aria-label="Пагинация">
      <button className="pagination__page" type="button" onClick={() => go(Math.max(1, page - 1))} disabled={page === 1}>
        ‹
      </button>
      {buildPages().map((num) => (
        <button
          key={num}
          className={`pagination__page ${page === num ? 'active' : ''}`}
          type="button"
          onClick={() => go(num)}
        >
          {num}
        </button>
      ))}
      <button
        className="pagination__page"
        type="button"
        onClick={() => go(Math.min(pages, page + 1))}
        disabled={page === pages}
      >
        ›
      </button>
    </div>
  );
}

export default Pagination;
