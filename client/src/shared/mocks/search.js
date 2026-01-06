const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function stableSeed(input) {
  return Array.from(String(input)).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 17);
}

export function buildHistogramMock(inn = '0000', from = '2024-01-01', to = '2024-03-01') {
  const start = new Date(from);
  const end = new Date(to);
  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const base = Number(String(inn).slice(-4)) || 1;
  return months.map((date, index) => ({
    date: date.toISOString(),
    label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
    total: ((base + index * 7) % 83) + 5,
    risk: Math.max(1, Math.floor((((base + index * 7) % 83) + 5) / 3)),
  }));
}

export function buildDocumentMock(inn = '0000', index = 1) {
  const seed = stableSeed(`${inn}-${index}`);
  const issueDate = new Date(2024, (index - 1) % 12, (index % 27) + 1, 12);
  return {
    id: `mock-${inn}-${index}`,
    issueDate: issueDate.toISOString(),
    url: `https://example.com/articles/${inn}/${index}`,
    source: { name: 'Mock Source' },
    title: { text: `Публикация ${index} для ИНН ${inn}` },
    content: { markup: `<p>Демо документ ${inn}-${index}. Пример локального мок-ответа.</p>` },
    attributes: {
      isTechNews: (seed + index) % 3 === 0,
      isAnnouncement: (seed + index) % 4 === 0,
      isDigest: (seed + index) % 5 === 0,
      wordCount: 400 + index * 5,
    },
  };
}
