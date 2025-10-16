# 🐳 Docker Setup для TrueGIS Social Video

## ⚠️ ВАЖНО - Общая База Данных

**Этот проект использует ОБЩУЮ базу данных `truegis_delivery`.**

MongoDB НЕ включена в docker-compose, так как база данных используется несколькими приложениями.

---

## 🚀 Быстрый старт

### 1. Подготовка

Убедитесь что на сервере установлен **yt-dlp**:

```bash
# Проверка установки
which yt-dlp

# Если не установлен:
pip install yt-dlp
# или
brew install yt-dlp  # на macOS
# или
apt install yt-dlp   # на Ubuntu/Debian
```

### 2. Настройка переменных окружения

Скопируйте пример и заполните реальными значениями:

```bash
cp .env.docker.example .env
```

Отредактируйте `.env`:

```env
# ВАЖНО: Укажите URL вашей СУЩЕСТВУЮЩЕЙ MongoDB
MONGODB_URI=mongodb://host.docker.internal:27017/truegis_delivery
MONGO_URL=mongodb://host.docker.internal:27017/truegis_delivery

# Ваш реальный Telegram Bot Token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# JWT Secret (генерируйте надежный)
JWT_SECRET=your_super_secret_key_min_32_chars
```

**Для подключения к MongoDB на хосте:**
- Используйте `host.docker.internal` (Docker Desktop на Mac/Windows)
- Или IP адрес хоста: `mongodb://192.168.1.100:27017/truegis_delivery`
- Или если MongoDB в другом контейнере: `mongodb://container-name:27017/truegis_delivery`

### 3. Сборка и запуск

```bash
# Сборка контейнера
docker-compose build

# Запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f server

# Остановка
docker-compose down
```

---

## 📁 Структура Docker

```
TrueGisMedia/
├── docker-compose.yml      # Конфигурация Docker Compose
├── .env                    # Переменные окружения (создайте из .env.docker.example)
├── server/
│   ├── Dockerfile         # Dockerfile для сервера
│   ├── downloads/         # Папка для скачанных видео (монтируется)
│   └── uploads/           # Папка для загруженных файлов (монтируется)
```

---

## 🔧 Конфигурация

### Порты

По умолчанию сервер доступен на порту **3009**:

```
http://localhost:3009
```

Чтобы изменить порт, отредактируйте `docker-compose.yml`:

```yaml
ports:
  - "ВНЕШНИЙ_ПОРТ:3000"
```

### Volumes (Постоянное хранение)

```yaml
volumes:
  - ./server/downloads:/app/downloads  # Видеофайлы
  - ./server/uploads:/app/uploads      # Загруженные файлы
```

Файлы сохраняются на хосте, поэтому не теряются при перезапуске контейнера.

---

## 🗄️ MongoDB Connection

**Варианты подключения:**

### 1. MongoDB на том же хосте

```env
MONGODB_URI=mongodb://host.docker.internal:27017/truegis_delivery
```

### 2. MongoDB на удаленном сервере

```env
MONGODB_URI=mongodb://username:password@remote-server.com:27017/truegis_delivery
```

### 3. MongoDB Atlas (Cloud)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truegis_delivery
```

### 4. MongoDB в другом Docker контейнере

```env
MONGODB_URI=mongodb://mongodb-container-name:27017/truegis_delivery
```

Добавьте в docker-compose.yml:

```yaml
networks:
  truegis-network:
    external: true  # Если сеть уже существует
```

---

## 🎬 yt-dlp Configuration

**ВАЖНО:** yt-dlp НЕ устанавливается в контейнер.

### Вариант 1: Установка на хосте (Рекомендуется)

```bash
# Установка на хост-системе
pip install yt-dlp

# Docker будет использовать yt-dlp с хоста через volume mount
```

Обновите docker-compose.yml:

```yaml
volumes:
  - ./server/downloads:/app/downloads
  - ./server/uploads:/app/uploads
  - /usr/local/bin/yt-dlp:/usr/local/bin/yt-dlp  # Mount yt-dlp
```

### Вариант 2: Отдельный контейнер для скачивания

Если хотите изолировать yt-dlp, создайте отдельный microservice.

---

## 🔍 Проверка работы

### 1. Проверка контейнера

```bash
# Статус
docker-compose ps

# Логи
docker-compose logs -f server

# Войти в контейнер
docker-compose exec server sh
```

### 2. Проверка API

```bash
# Health check
curl http://localhost:3009/

# API info
curl http://localhost:3009/api

# Получить видео feed
curl http://localhost:3009/api/videos/feed
```

### 3. Проверка подключения к БД

В логах должна быть строка:

```
✅ MongoDB Connected: your-mongodb-host
📊 Database: truegis_delivery
```

---

## 🐛 Troubleshooting

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs server

# Пересоздайте контейнер
docker-compose down
docker-compose up --build
```

### Ошибка подключения к MongoDB

```bash
# Проверьте переменные окружения
docker-compose config

# Проверьте что MongoDB доступна с хоста
docker-compose exec server ping host.docker.internal
```

### yt-dlp не работает

```bash
# Войдите в контейнер
docker-compose exec server sh

# Проверьте наличие yt-dlp
which yt-dlp
yt-dlp --version
```

Если yt-dlp не найден, установите на хост и смонтируйте в контейнер.

### Файлы не сохраняются

Проверьте права доступа к папкам:

```bash
chmod -R 755 server/downloads server/uploads
```

---

## 📊 Мониторинг

### Логи в реальном времени

```bash
docker-compose logs -f server
```

### Использование ресурсов

```bash
docker stats truegis-video-server
```

### Очистка старых видео

```bash
# Очистка downloads папки (будьте осторожны!)
docker-compose exec server sh -c "cd /app/downloads && find . -type f -mtime +30 -delete"
```

---

## 🔄 Обновление

### Обновление кода

```bash
# Остановка
docker-compose down

# Обновите код (git pull)

# Пересоздание и запуск
docker-compose build --no-cache
docker-compose up -d
```

### Просмотр логов после обновления

```bash
docker-compose logs -f server
```

---

## 🛡️ Production рекомендации

1. **Используйте .env файл** - никогда не коммитьте его в Git
2. **Настройте reverse proxy** (nginx) перед сервером
3. **Включите HTTPS** для production
4. **Настройте логирование** в файл (не только stdout)
5. **Регулярно делайте бэкапы** папок downloads/uploads
6. **Ограничьте размер логов** Docker:

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 📝 Команды для продакшена

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Перезапуск
docker-compose restart

# Обновление без downtime
docker-compose up -d --no-deps --build server

# Бэкап данных
tar -czf backup-$(date +%Y%m%d).tar.gz server/downloads server/uploads

# Просмотр логов последних 100 строк
docker-compose logs --tail=100 server
```

---

Made with ❤️ for TrueGIS Platform

