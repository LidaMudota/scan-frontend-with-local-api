const crypto = require('crypto');

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function buildUser({ id, login, password, name, tariff, companyLimit, usedCompanyCount }) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  return {
    id,
    login,
    name,
    salt,
    passwordHash,
    tariff,
    companyLimit,
    usedCompanyCount,
  };
}

const users = [
  buildUser({
    id: 'u1',
    login: 'myDiploma',
    password: 'willSucceed4Sure',
    name: 'Никита',
    tariff: 'beginner',
    companyLimit: 1000,
    usedCompanyCount: 34,
  }),
  buildUser({
    id: 'u2',
    login: 'proUser',
    password: 'proPass',
    name: 'Pro Пользователь',
    tariff: 'pro',
    companyLimit: 5000,
    usedCompanyCount: 120,
  }),
  buildUser({
    id: 'u3',
    login: 'bizUser',
    password: 'bizPass',
    name: 'Biz Клиент',
    tariff: 'business',
    companyLimit: 20000,
    usedCompanyCount: 560,
  }),
];

const tariffs = {
  beginner: 'beginner',
  pro: 'pro',
  business: 'business',
};

function findUserByLogin(login) {
  if (!login) return null;
  return users.find((user) => user.login === login);
}

function addUser({ login, password, name }) {
  const user = buildUser({
    id: `u${users.length + 1}-${Date.now()}`,
    login,
    password,
    name,
    tariff: tariffs.beginner,
    companyLimit: 1000,
    usedCompanyCount: 0,
  });

  users.push(user);
  return user;
}

function verifyUserCredentials(login, password) {
  const existing = findUserByLogin(login);
  if (!existing) return null;
  const expectedHash = hashPassword(password, existing.salt);
  return expectedHash === existing.passwordHash ? existing : null;
}

function getUserById(id) {
  return users.find((user) => user.id === id);
}

module.exports = {
  users,
  tariffs,
  addUser,
  findUserByLogin,
  verifyUserCredentials,
  getUserById,
  hashPassword,
};
