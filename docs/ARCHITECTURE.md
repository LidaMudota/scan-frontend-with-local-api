# Архитектура starter-kit

## Слои
- **`src/app`** — инициализация приложения, роутер, провайдеры (store, auth), базовые layout'ы.
- **`src/pages`** — страницы верхнего уровня, отвечающие за маршрут целиком.
- **`src/widgets`** — крупные композиции UI (секции, списки, сводки), собирающие данные из фич/сущностей.
- **`src/features`** — функциональные блоки, завязанные на конкретный сценарий (auth, search).
- **`src/entities`** — работа с доменными сущностями (account, search items): сервисы, нормализация данных.
- **`src/shared`** — UI-kit, конфиг, API-клиент, утилиты, константы, моки.

## Завязки
- API-запросы идут через `src/shared/api/http.js`, пути — `src/shared/api/endpoints.js`, типы/контракты — `src/shared/api/types.js`.
- Конфигурация окружения читается из `src/shared/config/index.js`; прямые обращения к `import.meta.env` не допускаются.
- Redux store собирается в `src/app/store.js`; AuthProvider и RequireAuth — в `src/features/auth`.
- Локальный API (папка `api/src`) использует генераторы из `api/src/mocks` для детерминированных ответов.

## Расширение
- Новые страницы: `src/pages/<Name>/<Name>.jsx`, подключаем через `src/app/AppRouter.jsx`.
- Новые фичи: создаём модуль в `src/features/<feature>` и подключаем стор/виджеты в страницах.
- Новые сущности: сервисы в `src/entities/<entity>/api.js`, UI-представления — в widgets.
