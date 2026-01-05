const tokenStorage = new Map();

function formatExpireMs(ms) {
  const iso = new Date(ms).toISOString();
  return iso.replace('Z', '+03:00');
}

function createToken(userId) {
  const expireMs = Date.now() + 60 * 60 * 1000;
  const token = `token-${userId}-${Date.now()}`;
  tokenStorage.set(token, { userId, expireMs });
  return { token, expire: formatExpireMs(expireMs), expireMs };
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token || !tokenStorage.has(token)) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  const meta = tokenStorage.get(token);
  if (!meta || meta.expireMs < Date.now()) {
    tokenStorage.delete(token);
    return res.status(401).json({ message: 'Срок действия токена истёк' });
  }

  req.userId = meta.userId;
  req.tokenExpireMs = meta.expireMs;
  return next();
}

module.exports = {
  tokenStorage,
  createToken,
  verifyToken,
  formatExpireMs,
};
