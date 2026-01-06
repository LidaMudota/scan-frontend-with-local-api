import './ui.css';

export function EmptyState({ title = 'Пусто', description }) {
  return (
    <div className="empty-state card">
      <h3>{title}</h3>
      {description && <p className="text-muted">{description}</p>}
    </div>
  );
}

export default EmptyState;
