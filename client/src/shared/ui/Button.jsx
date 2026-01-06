import './ui.css';

export function Button({ variant = 'default', children, className = '', ...props }) {
  const variantClass = variant === 'primary' ? 'primary' : variant === 'ghost' ? 'ghost' : '';
  return (
    <button className={`btn ${variantClass} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

export default Button;
