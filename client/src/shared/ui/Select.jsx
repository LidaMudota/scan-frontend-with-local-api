import './ui.css';

export function Select({ label, options = [], className = '', ...props }) {
  return (
    <label className={`ui-stack ${className}`.trim()}>
      {label && <span className="field-label">{label}</span>}
      <select className="select" {...props}>
        {options.map((opt) => (
          <option key={opt.value ?? opt.label} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Select;
