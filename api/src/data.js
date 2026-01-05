const users = [
  {
    id: 'u1',
    login: 'myDiploma',
    password: 'willSucceed4Sure',
    name: 'Никита',
    tariff: 'beginner',
    companyLimit: 1000,
    usedCompanyCount: 34,
  },
  {
    id: 'u2',
    login: 'proUser',
    password: 'proPass',
    name: 'Pro Пользователь',
    tariff: 'pro',
    companyLimit: 5000,
    usedCompanyCount: 120,
  },
  {
    id: 'u3',
    login: 'bizUser',
    password: 'bizPass',
    name: 'Biz Клиент',
    tariff: 'business',
    companyLimit: 20000,
    usedCompanyCount: 560,
  },
];

const tariffs = {
  beginner: 'beginner',
  pro: 'pro',
  business: 'business',
};

module.exports = {
  users,
  tariffs,
};
