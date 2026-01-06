function monthRange(startDate, endDate) {
  const result = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (cursor <= end) {
    result.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

function histogramValue(base, index) {
  return ((base + index * 7) % 83) + 5;
}

function stableSeed(input) {
  return Array.from(String(input)).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000,
    17
  );
}

function extractDocMeta(id) {
  if (typeof id !== 'string') return null;
  const dashMatch = /^doc-(.+?)-(\d+)$/.exec(id);
  if (dashMatch) {
    return { inn: dashMatch[1], index: Number(dashMatch[2]) };
  }
  const legacyMatch = /doc:(\d+):(\d+)/.exec(id);
  if (legacyMatch) {
    return { inn: legacyMatch[1], index: Number(legacyMatch[2]) };
  }
  return null;
}

module.exports = {
  monthRange,
  histogramValue,
  stableSeed,
  extractDocMeta,
};
