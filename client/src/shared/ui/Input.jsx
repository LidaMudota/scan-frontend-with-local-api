import './ui.css';

export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <label className={`ui-stack ${className}`.trim()}>
      {label && <span className="field-label">{label}</span>}
      <input className="input" {...props} />
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="ui-error">{error}</span>}
    </label>
  );
}

export default Input;
