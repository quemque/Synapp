# 📝 SynApp: Современное приложение для управления задачами и активностями

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://todo-react-navy-omega.vercel.app/)
[![React](https://img.shields.io/badge/React-19.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)

**SynApp** — это полнофункциональное веб-приложение для управления задачами, активностями и расписанием с современной архитектурой, системой уведомлений и кроссплатформенной синхронизацией данных.

## ✨ Ключевые особенности

### 🔐 Система аутентификации

- **Полная регистрация и авторизация** с JWT токенами
- **Безопасное хеширование паролей** с помощью bcryptjs
- **Защищенные маршруты** с middleware аутентификации
- **Автоматическое обновление токенов** и управление сессиями

### 📋 Управление задачами

- **Создание, редактирование и удаление задач** с валидацией
- **Система категорий** для организации задач
- **Drag & Drop переупорядочивание** с помощью @dnd-kit
- **Фильтрация задач** (все, активные, завершенные)
- **Массовые операции** (очистка завершенных задач)

### 🔔 Система уведомлений

- **Напоминания о задачах** с настраиваемым временем
- **Браузерные уведомления** с иконкой приложения
- **Автоматическая отмена** уведомлений для завершенных задач
- **Управление разрешениями** на уведомления

### 📅 Планировщик активностей

- **Создание активностей** с датой и временем
- **Календарное представление** расписания
- **Управление расписанием** с возможностью редактирования

### 🏷️ Система тегов

- **Динамические теги** для категоризации задач
- **Цветовая кодировка** тегов
- **Фильтрация по тегам** с отдельными страницами

### 📱 Адаптивный дизайн

- **Мобильная оптимизация** для всех устройств
- **Современный UI/UX** с Material-UI компонентами
- **Темная/светлая тема** (планируется)

### 🐳 Контейнеризация

- **Docker Compose** для полного стека
- **Отдельные контейнеры** для frontend, backend и MongoDB
- **Горячая перезагрузка** в режиме разработки

### ⚡ Высокая производительность

- **Vite** для быстрой сборки и HMR
- **TypeScript** для типобезопасности
- **Оптимизированные запросы** к API
- **Кэширование данных** в localStorage

### 🧪 Тестирование

- **Jest** для backend тестирования
- **Vitest** для frontend тестирования
- **React Testing Library** для компонентного тестирования
- **Покрытие кода** с детальными отчетами

## 🛠️ Технологический стек

### Frontend

- **React 19.1** с функциональными компонентами и хуками
- **TypeScript 5.9** для типобезопасности
- **Vite 7.1** — современный сборщик и dev-сервер
- **React Router DOM 7.8** — клиентская маршрутизация
- **Material-UI 7.3** — компоненты интерфейса
- **@dnd-kit** — drag & drop функциональность
- **React Icons 5.5** — иконки
- **Emotion** — CSS-in-JS стилизация

### Backend

- **Node.js 20+** с ES модулями
- **Express.js 4.21** — веб-фреймворк
- **MongoDB 6** с Mongoose 7.8 ODM
- **JWT** — аутентификация и авторизация
- **bcryptjs 2.4** — хеширование паролей
- **CORS** — настройка кросс-доменных запросов
- **dotenv** — управление переменными окружения

### Тестирование

- **Jest 29.7** — тестирование backend
- **Vitest 3.2** — тестирование frontend
- **Supertest 7.0** — HTTP тестирование
- **React Testing Library 16.3** — тестирование компонентов
- **MongoDB Memory Server 9.1** — изолированное тестирование БД

### Инфраструктура

- **Docker & Docker Compose** — контейнеризация
- **Vercel** — хостинг и деплой frontend
- **Railway** — хостинг backend API
- **MongoDB Atlas** — облачная база данных
- **Orange Pi Zero 2W** — домашний сервер с nginx и certbot

## 🚀 Быстрый старт

### Предварительные требования

- [Node.js](https://nodejs.org/) версия 20 или выше
- [Docker](https://www.docker.com/products/docker-desktop/) (рекомендуется)
- [Git](https://git-scm.com/)

### Установка и запуск (Docker - Рекомендуется)

1. **Клонирование репозитория:**

   ```bash
   git clone https://github.com/quemque/Synapp.git
   cd Synapp
   ```

2. **Запуск с Docker Compose:**

   ```bash
   docker-compose up
   ```

3. **Открытие приложения:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001](http://localhost:3001)
   - MongoDB: localhost:27017

### Установка и запуск (Ручная установка)

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Переменные окружения

Создайте файлы `.env` в соответствующих директориях:

**backend/.env:**

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/synapp
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

**frontend/.env:**

```env
VITE_API_URL=http://localhost:3001
VITE_DEBUG_LOGS=false
```

## 📁 Структура проекта

```
synapp/
├── backend/                    # Backend приложения
│   ├── src/
│   │   ├── __tests__/         # Тесты backend
│   │   │   ├── models/        # Тесты моделей
│   │   │   ├── routes/        # Тесты API маршрутов
│   │   │   └── setup.js       # Настройка тестов
│   │   ├── models/            # Mongoose модели
│   │   │   └── User.js        # Модель пользователя с задачами
│   │   ├── routes/            # API маршруты
│   │   │   ├── auth.js        # Аутентификация
│   │   │   ├── tasks.js       # Управление задачами
│   │   │   └── activities.js  # Управление активностями
│   │   ├── utils/             # Утилиты
│   │   │   └── logger.js      # Логирование
│   │   └── server.js          # Точка входа сервера
│   ├── jest.config.cjs        # Конфигурация Jest
│   └── package.json
├── frontend/                   # Frontend приложения
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   │   ├── Auth/          # Компоненты аутентификации
│   │   │   ├── Sidebar/       # Боковая панель навигации
│   │   │   ├── ui/            # UI компоненты
│   │   │   └── handlers/      # Обработчики данных
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.tsx # Контекст аутентификации
│   │   ├── hooks/             # Пользовательские хуки
│   │   │   ├── useTask.tsx    # Хук управления задачами
│   │   │   └── useActivity.tsx # Хук управления активностями
│   │   ├── pages/             # Страницы приложения
│   │   │   ├── HomePage.tsx   # Главная страница
│   │   │   ├── TagsPage.tsx   # Страница тегов
│   │   │   └── ShedulePage.tsx # Страница расписания
│   │   ├── services/          # Сервисы
│   │   │   ├── api.ts         # API клиент
│   │   │   ├── notificationService.ts # Уведомления
│   │   │   └── logService.ts  # Логирование
│   │   ├── test/              # Тесты frontend
│   │   ├── types/             # TypeScript типы
│   │   └── utils/             # Утилиты
│   ├── public/                # Статические файлы
│   ├── vitest.config.js       # Конфигурация Vitest
│   └── package.json
├── docker-compose.yml         # Docker Compose конфигурация
├── vercel.json               # Конфигурация Vercel
└── package.json              # Корневой package.json
```

## 🔌 API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Авторизация пользователя

### Задачи

- `GET /api/tasks/:userId` - Получить задачи пользователя
- `PUT /api/tasks/:userId` - Сохранить задачи пользователя

### Активности

- `GET /api/activities/:userId` - Получить активности пользователя
- `PUT /api/activities/:userId` - Сохранить активности пользователя

### Системные

- `GET /api/health` - Проверка состояния сервера
- `GET /api/test-cors` - Тест CORS настроек

## 🧪 Тестирование

### Backend тесты

```bash
cd backend
npm test                 # Запуск всех тестов
npm run test:watch       # Режим наблюдения
npm run test:coverage    # С покрытием кода
```

### Frontend тесты

```bash
cd frontend
npm test                 # Запуск всех тестов
npm run test:ui          # UI интерфейс тестов
npm run test:run         # Однократный запуск
```

## 🚀 Деплой

### Vercel (Frontend)

```bash
vercel --prod
```

### Railway (Backend)

```bash
railway login
railway up
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 🏠 Домашний сервер (Orange Pi Zero 2W)

Приложение полностью развернуто на домашнем сервере Orange Pi Zero 2W с использованием nginx и certbot для SSL сертификатов.

**Доступ к приложению:** [https://synapp.duckdns.org/](https://synapp.duckdns.org/)

**Технические детали:**

- **Оборудование**: Orange Pi Zero 2W (ARM-процессор)
- **Веб-сервер**: nginx с reverse proxy
- **SSL сертификаты**: Let's Encrypt через certbot
- **Домен**: DuckDNS динамический DNS
- **Контейнеризация**: Docker Compose для полного стека
- **Автоматическое обновление**: SSL сертификаты обновляются автоматически

**Преимущества домашнего развертывания:**

- ✅ Полный контроль над данными
- ✅ Отсутствие ограничений облачных провайдеров
- ✅ Бесплатный хостинг
- ✅ SSL сертификаты от Let's Encrypt
- ✅ Высокая производительность на ARM-процессоре

## 🔧 Разработка

### Добавление новых функций

1. Создайте feature ветку: `git checkout -b feature/new-feature`
2. Реализуйте изменения с тестами
3. Запустите тесты: `npm test`
4. Создайте Pull Request

### Структура коммитов

```
feat: добавлена новая функция
fix: исправлена ошибка
docs: обновлена документация
test: добавлены тесты
refactor: рефакторинг кода
```

## 📊 Мониторинг и логирование

- **Детальное логирование** всех операций с эмодзи-индикаторами
- **CORS мониторинг** с логированием запросов
- **Валидация данных** с подробными сообщениями об ошибках
- **Health check** endpoint для мониторинга состояния

## 🔒 Безопасность

- **JWT токены** для аутентификации
- **Хеширование паролей** с bcryptjs
- **CORS настройки** для защиты от CSRF
- **Валидация входных данных** на всех уровнях
- **Защищенные маршруты** с middleware

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта!

1. **Fork** репозитория
2. Создайте **feature ветку**: `git checkout -b feature/AmazingFeature`
3. **Закоммитьте** изменения: `git commit -m 'Add some AmazingFeature'`
4. **Запушьте** ветку: `git push origin feature/AmazingFeature`
5. Откройте **Pull Request**

### Требования к коду

- Следуйте существующему стилю кода
- Добавляйте тесты для новых функций
- Обновляйте документацию при необходимости
- Используйте TypeScript для frontend кода

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 🙏 Благодарности

- React команде за отличный фреймворк
- Vite за быструю разработку
- MongoDB за надежную базу данных
- Всем контрибьюторам проекта

---

⭐ **Если проект был полезен, поставьте звезду на GitHub!**

🔗 **Демо**:

- **Облачная версия**: [https://todo-react-navy-omega.vercel.app/](https://todo-react-navy-omega.vercel.app/)
- **Домашний сервер**: [https://synapp.duckdns.org/](https://synapp.duckdns.org/)

📧 **Поддержка**: Создайте issue в репозитории для вопросов и предложений
