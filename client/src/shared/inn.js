export function isValidInn(value) {
  const inn = (value || '').replace(/\D/g, '');
  if (![10, 12].includes(inn.length)) return false;

  const checkDigit = (digits, multipliers) => {
    const sum = digits.reduce((acc, digit, idx) => acc + digit * multipliers[idx], 0);
    return (sum % 11) % 10;
  };

  const digits = inn.split('').map(Number);

  if (inn.length === 10) {
    const multipliers = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    return checkDigit(digits, multipliers) === digits[9];
  }

  const multipliers11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
  const multipliers12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

  const first = checkDigit(digits, multipliers11);
  const second = checkDigit(digits, multipliers12);

  return first === digits[10] && second === digits[11];
}
