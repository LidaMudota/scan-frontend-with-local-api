# Как расширять под клиента

## Новые фичи и страницы
- Добавляйте страницы в `src/pages/<Name>/<Name>.jsx`, регистрируйте маршрут в `src/app/AppRouter.jsx`.
- Фичи с бизнес-логикой — в `src/features/<feature>`, выносите API-запросы в `src/entities` или `src/shared/api`.
- Крупные секции/виджеты — в `src/widgets`, собирайте из UI-kit и данных фич/сущностей.

## Брендинг и UI
- Базовые токены/классы — в `src/shared/ui/ui.css`. Добавьте темы или вариации кнопок/инпутов, не меняя семантику.
- Компоненты UI-kit (`Button`, `Input`, `Select`, `Modal`, `Tabs`, `Loader`, `EmptyState`, `Pagination`) можно расширять пропсами или адаптерами.

## Работа с API
- Базовый URL и префикс задаются через `.env` (`VITE_API_BASE_URL`, `VITE_API_PREFIX`), чтение — через `src/shared/config`.
- Путь к endpoint'ам — `src/shared/api/endpoints.js`, контракты — `src/shared/api/types.js`.
- Для новых сущностей создавайте сервисы `src/entities/<entity>/api.js`, которые нормализуют ответы под UI.

## Моки и тестовые данные
- Генераторы локального API лежат в `api/src/mocks`; при замене на реальный backend отключите импорт моков в `api/src/server.js`.
- UI-моки и заглушки можно хранить в `src/shared/mocks`, подключать их в сторы или компоненты для дев-режима.
