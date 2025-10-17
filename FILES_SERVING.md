# 📁 Как сервер отдает файлы

## 🎬 Видео файлы

### Сервер:

```typescript
// server/src/index.ts
const downloadPath = path.join(process.cwd(), "downloads");
app.use("/downloads", express.static(downloadPath, {
  setHeaders: (res, filePath) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Accept-Ranges", "bytes");  // Поддержка Range запросов
    res.set("Cache-Control", "public, max-age=86400");
  }
}));
```

### Клиент:

```typescript
// client/src/components/VideoFeed/VideoFeed.tsx
const apiBaseUrl = "http://localhost:3000"; // или с .env
const videoUrl = `${apiBaseUrl}/downloads/${video.url}`;

<video src={videoUrl} />
```

### Как это работает:

```
1. Видео сохраняется: server/downloads/1760616685204_7a6750576f3e6e52.mp4
                              ↓
2. В БД сохраняется:   url: "1760616685204_7a6750576f3e6e52.mp4"
                              ↓
3. Клиент запрашивает: http://localhost:3000/downloads/1760616685204_7a6750576f3e6e52.mp4
                              ↓
4. Express static отдает файл из: process.cwd()/downloads/1760616685204_7a6750576f3e6e52.mp4
```

---

## 🖼️ Thumbnail изображения

### Для локальных файлов:

```typescript
// Если thumbnail - это файл в downloads/
thumbnail: "thumb_123.jpg"
         ↓
URL: http://localhost:3000/downloads/thumb_123.jpg
```

### Для внешних URL (Instagram, TikTok):

```typescript
// Если thumbnail - это Instagram URL
thumbnail: "https://instagram.ftas3-2.fna.fbcdn.net/v/t51.2885-15/image.jpg"
         ↓
Proxy URL: http://localhost:3000/api/proxy/image?url=https%3A%2F%2Finstagram...
         ↓
Сервер запрашивает изображение с правильными headers
         ↓
Клиент получает изображение
```

**Почему нужен proxy?**
- Instagram блокирует прямые запросы из браузера (CORS)
- Нужны специальные headers (Referer, User-Agent)
- Proxy добавляет эти headers на сервере

---

## 🔍 Debug endpoints

### Проверить пути и файлы:

```bash
# API info с путями
curl http://localhost:3009/api

# Ответ:
{
  "message": "TrueGIS Social Video API",
  "version": "1.0.0",
  "paths": {
    "downloads": "/app/downloads",  # В контейнере
    "cwd": "/app"                    # WORKDIR контейнера
  }
}
```

### Список файлов в downloads:

```bash
curl http://localhost:3009/api/debug/files

# Ответ:
{
  "success": true,
  "downloadPath": "/app/downloads",
  "filesCount": 5,
  "files": [
    "1760616685204_7a6750576f3e6e52.mp4",
    "1760616685205_8b7860687g4f7f63.mp4",
    ...
  ]
}
```

### Прямой доступ к файлу:

```bash
# Проверить что файл отдается
curl -I http://localhost:3009/downloads/1760616685204_7a6750576f3e6e52.mp4

# Должно быть:
HTTP/1.1 200 OK
Content-Type: video/mp4
Accept-Ranges: bytes
Cache-Control: public, max-age=86400
Access-Control-Allow-Origin: *
```

---

## 📊 Полный путь данных

### Сохранение видео:

```
yt-dlp скачивает → /app/downloads/video.mp4 (в контейнере)
                            ↓
Docker монтирует  → ./server/downloads/video.mp4 (на хосте)
                            ↓
MongoDB сохраняет → { url: "video.mp4", ... }
```

### Получение видео:

```
Клиент запрашивает → http://localhost:3009/downloads/video.mp4
                            ↓
Nginx проксирует   → http://localhost:3009/downloads/video.mp4
                            ↓
Express static     → Читает /app/downloads/video.mp4
                            ↓
Docker монтирует   → ./server/downloads/video.mp4
                            ↓
Файл отдается клиенту
```

---

## ✅ Проверка работы

### На сервере:

```bash
# 1. Проверить что папка смонтирована
docker exec truegis-video-server ls -la /app/downloads

# 2. Проверить что Express видит файлы
curl http://localhost:3009/api/debug/files

# 3. Скачать видео через API
curl -X POST http://localhost:3009/api/download/download \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.instagram.com/reel/...",
    "user": {
      "telegram_id": 123,
      "telegram_name": "Test"
    }
  }'

# 4. Проверить что файл создался
ls -lh server/downloads/

# 5. Попробовать получить файл
curl -I http://localhost:3009/downloads/ИМЯ_ФАЙЛА.mp4
```

### На клиенте:

Откройте DevTools → Network и проверьте запросы к видео:

```
Request: http://localhost:3009/downloads/video.mp4
Status: 200 OK
Type: video/mp4
Headers:
  Accept-Ranges: bytes
  Access-Control-Allow-Origin: *
```

---

## 🔧 Nginx конфигурация (для production)

```nginx
# Прямая отдача файлов (быстрее)
location /downloads {
    alias /opt/projects/TrueGisMedia/server/downloads;
    add_header Access-Control-Allow-Origin *;
    add_header Accept-Ranges bytes;
    add_header Cache-Control "public, max-age=86400";
}

# Или через proxy к серверу
location /downloads {
    proxy_pass http://localhost:3009;
    proxy_http_version 1.1;
    proxy_set_header Range $http_range;
    proxy_set_header If-Range $http_if_range;
    proxy_buffering off;
}
```

---

Made with ❤️ for TrueGIS Platform

