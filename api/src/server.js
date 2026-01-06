const express = require('express');
const cors = require('cors');
const {
  users,
  tariffs,
  addUser,
  findUserByLogin,
  verifyUserCredentials,
  getUserById,
} = require('./data');
const { createToken, verifyToken } = require('./auth');
const { monthRange, histogramValue, stableSeed, extractDocMeta } = require('./mocks/generators');

const app = express();
const PORT = 4000;
const API_PREFIX = '/api/v1';

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use((req, _res, next) => {
  if (!req.url.includes('//')) {
    return next();
  }
  const [path = '', query = ''] = req.url.split('?');
  const normalizedPath = path.replace(/\/{2,}/g, '/');
  req.url = query ? `${normalizedPath}?${query}` : normalizedPath;
  next();
});

app.use(express.json());

function sendError(res, status, message) {
  return res.status(status).json({ status, message });
}

function validatePassword(password) {
  if (typeof password !== 'string') return false;
  const hasLength = password.length >= 8;
  const hasDigit = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  return hasLength && hasDigit && hasLetter;
}

function validateLogin(login) {
  if (typeof login !== 'string') return false;
  return /^[A-Za-z0-9._-]{3,32}$/.test(login);
}

function validateName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 32) return false;
  return /^[\p{L}\s-]+$/u.test(trimmed);
}

app.post(`${API_PREFIX}/account/register`, (req, res) => {
  console.log('[HIT] register', req.method, req.originalUrl, req.body);
  const { login, password, name } = req.body || {};

  if (!validateLogin(login)) {
    return sendError(res, 400, 'Некорректный логин');
  }

  if (!validateName(name)) {
    return sendError(res, 400, 'Некорректное имя');
  }

  if (!validatePassword(password)) {
    return sendError(res, 400, 'Пароль слишком простой');
  }

  const existing = findUserByLogin(login);
  if (existing) {
    return sendError(res, 409, 'Логин уже занят');
  }

  const trimmedName = name.trim();
  addUser({ login, password, name: trimmedName });
  return res.status(201).json({ message: 'OK' });
});

app.post(`${API_PREFIX}/account/login`, (req, res) => {
  const { login, password } = req.body || {};
  const found = verifyUserCredentials(login, password);

  if (!found) {
    return sendError(res, 401, 'Неверный логин или пароль');
  }

  const { token, expire, expireMs } = createToken(found.id);
  return res.json({ accessToken: token, expire, expireMs });
});

app.get(`${API_PREFIX}/account/info`, verifyToken, (req, res) => {
  const found = getUserById(req.userId);
  if (!found) {
    return sendError(res, 404, 'Пользователь не найден');
  }

  return res.json({
    eventFiltersInfo: {
      usedCompanyCount: found.usedCompanyCount ?? 0,
      companyLimit: found.companyLimit ?? 1000,
    },
    tariff: found.tariff || tariffs.beginner,
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
  const { limit = 10, searchContext, issueDateInterval } = req.body || {};
  const inn =
    searchContext?.targetSearchEntitiesContext?.targetSearchEntities?.[0]?.inn?.toString() || '0';
  const { startDate, endDate } = issueDateInterval || {};
  const count = Math.min(Math.max(Number(limit) || 0, 30), 1000);
  const seed = stableSeed(`${inn}-${startDate || ''}-${endDate || ''}`);
  const items = Array.from({ length: count }, (_, idx) => ({
    encodedId: `doc-${inn}-${idx + 1}`,
    influence: (idx % 12) + 1,
    similarCount: (seed + idx * 3) % 7,
  }));

  return res.json({ items, mappings: [] });
});

app.post(`${API_PREFIX}/documents`, verifyToken, (req, res) => {
  const { ids = [] } = req.body || {};
  if (!Array.isArray(ids)) {
    return sendError(res, 400, 'ids должны быть массивом');
  }

  if (ids.length > 100) {
    return sendError(res, 400, 'Максимум 100 документов за запрос');
  }

  const responses = ids.map((id) => {
    const meta = extractDocMeta(id);
    if (!meta) {
      return { fail: { errorCode: 'NOT_FOUND', errorMessage: 'Документ не распознан' } };
    }

    const { inn, index } = meta;
    const month = (index - 1) % 12;
    const issueDate = new Date(2024, month, (index % 27) + 1, 12);
    const baseUrl = `https://example.com/articles/${inn}/${index}`;
    const hasImage = index % 2 === 0;
    const baseSeed = stableSeed(`${inn}-${index}`);
    const markup = [
      `<p>Материал по ИНН ${inn} номер ${index}. Этот текст иллюстрирует выдачу поиска.</p>`,
      '<p>Мы формируем последовательное поведение без случайностей.</p>',
      hasImage ? `<img src="https://via.placeholder.com/640x360?text=${inn}-${index}" alt="placeholder" />` : '',
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
        title: { text: `Публикация ${index} для ИНН ${inn}` },
        content: { markup },
        attributes: {
          isTechNews: (baseSeed + index) % 3 === 0,
          isAnnouncement: (baseSeed + index) % 4 === 0,
          isDigest: (baseSeed + index) % 5 === 0,
          wordCount: 500 + index * 3,
        },
      },
    };
  });

  return res.json(responses);
});

app.use((req, res) => {
  sendError(res, 404, 'Неизвестный маршрут');
});

app.listen(PORT, () => {
  console.log(`API запущен на http://localhost:${PORT}${API_PREFIX}`);
});
