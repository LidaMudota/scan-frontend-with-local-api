export function normalizeInn(value) {
  return (value || '').toString().replace(/\D/g, '');
}

function computeChecksum(digits, coefficients) {
  const sum = coefficients.reduce((acc, coefficient, idx) => acc + coefficient * digits[idx], 0);
  return (sum % 11) % 10;
}

export function isValidInn(value) {
  const inn = normalizeInn(value);
  if (![10, 12].includes(inn.length)) return false;

  const digits = inn.split('').map(Number);

  if (inn.length === 10) {
    const checksum10 = computeChecksum(digits, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
    return checksum10 === digits[9];
  }

  const checksum11 = computeChecksum(digits, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
  const checksum12 = computeChecksum(digits, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);

  return checksum11 === digits[10] && checksum12 === digits[11];
}
