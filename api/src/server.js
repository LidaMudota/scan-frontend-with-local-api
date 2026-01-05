const express = require('express');
const cors = require('cors');
const { users } = require('./data');
const { createToken, verifyToken } = require('./auth');

const app = express();
const PORT = 4000;
const API_PREFIX = '/api/v1';

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);
app.use(express.json());

function findUser(login, password) {
  return users.find((user) => user.login === login && user.password === password);
}

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

app.post(`${API_PREFIX}/account/login`, (req, res) => {
  const { login, password } = req.body || {};
  const found = findUser(login, password);

  if (!found) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }

  const { token, expire } = createToken(found.id);
  return res.json({ accessToken: token, expire });
});

app.get(`${API_PREFIX}/account/info`, verifyToken, (req, res) => {
  const found = users.find((user) => user.id === req.userId);
  if (!found) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  return res.json({
    eventFiltersInfo: {
      usedCompanyCount: found.usedCompanyCount,
      companyLimit: found.companyLimit,
    },
    tariff: found.tariff,
    user: {
      name: found.name,
    },
  });
});

app.post(`${API_PREFIX}/objectsearch/histograms`, verifyToken, (req, res) => {
  const body = req.body || {};
  const { issueDateInterval, histogramTypes = [], searchContext } = body;
  const { startDate, endDate } = issueDateInterval || {};

  if (body.intervalType !== 'month') {
    return res.status(400).json({ message: 'intervalType должен быть month' });
  }

  if (!histogramTypes.includes('totalDocuments') || !histogramTypes.includes('riskFactors')) {
    return res.status(400).json({ message: 'histogramTypes должны включать totalDocuments и riskFactors' });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Некорректные даты' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const inn =
    searchContext?.targetSearchEntitiesContext?.targetSearchEntities?.[0]?.inn?.toString() || '0';
  const base = Number(inn.slice(-4)) || 1;
  const months = monthRange(start, end);

  const totalData = months.map((date, index) => ({
    date: date.toISOString(),
    value: histogramValue(base, index),
  }));

  const riskData = months.map((date, index) => ({
    date: date.toISOString(),
    value: Math.max(1, Math.floor(histogramValue(base, index) / 3)),
  }));

  return res.json({
    data: [
      { data: totalData, histogramType: 'totalDocuments' },
      { data: riskData, histogramType: 'riskFactors' },
    ],
  });
});

app.post(`${API_PREFIX}/objectsearch`, verifyToken, (req, res) => {
  const { limit = 10, searchContext } = req.body || {};
  const inn =
    searchContext?.targetSearchEntitiesContext?.targetSearchEntities?.[0]?.inn?.toString() || '0';
  const count = Math.min(Number(limit) || 0, 1000);
  const items = Array.from({ length: count }, (_, idx) => ({
    encodedId: `doc:${inn}:${idx + 1}`,
    influence: (idx % 12) + 1,
    similarCount: (idx * 3) % 7,
  }));

  return res.json({ items, mappings: [] });
});

app.post(`${API_PREFIX}/documents`, verifyToken, (req, res) => {
  const { ids = [] } = req.body || {};
  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: 'ids должны быть массивом' });
  }

  if (ids.length > 100) {
    return res.status(400).json({ message: 'Максимум 100 документов за запрос' });
  }

  const responses = ids.map((id) => {
    const match = /doc:(\d+):(\d+)/.exec(id);
    if (!match) {
      return { fail: { errorCode: 'NOT_FOUND', errorMessage: 'Документ не распознан' } };
    }

    const [, inn, indexStr] = match;
    const idx = Number(indexStr);
    const month = (idx - 1) % 12;
    const issueDate = new Date(2024, month, (idx % 27) + 1);
    const baseUrl = `https://example.com/articles/${inn}/${idx}`;
    const hasImage = idx % 2 === 0;
    const markup = [
      `<p>Материал по ИНН ${inn} номер ${idx}. Этот текст иллюстрирует выдачу поиска.</p>`,
      '<p>Мы формируем последовательное поведение без случайностей.</p>',
      hasImage ? `<img src="https://via.placeholder.com/640x360?text=${inn}-${idx}" alt="placeholder" />` : '',
      '<p>Данные сгенерированы локальным API.</p>',
    ]
      .filter(Boolean)
      .join('');

    return {
      ok: {
        id,
        issueDate: issueDate.toISOString(),
        url: baseUrl,
        source: { name: 'Demo Source' },
        title: { text: `Публикация ${idx} для ИНН ${inn}` },
        content: { markup },
        attributes: {
          isTechNews: idx % 3 === 0,
          isAnnouncement: idx % 4 === 0,
          isDigest: idx % 5 === 0,
          wordCount: 500 + idx * 3,
        },
      },
    };
  });

  return res.json(responses);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Неизвестный маршрут' });
});

app.listen(PORT, () => {
  console.log(`API запущен на http://localhost:${PORT}${API_PREFIX}`);
});
