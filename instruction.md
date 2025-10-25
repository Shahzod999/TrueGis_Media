138.197.187.214

root

# 1. Перейдите в корневую папку проекта

cd /opt/projects/TrueGisMedia

client

npm i
npm run build

# 2. Остановите текущие контейнеры

docker-compose down

git pull

# 3. Пересоберите образы с новым кодом

docker-compose build --no-cache

# 4. Запустите контейнеры заново

docker-compose up -d

# 5. Проверьте статус контейнеров

docker-compose ps

# 6. Проверьте логи сервера

docker-compose logs -f truegis-video-server

# 7. Проверьте логи nginx

docker-compose logs nginx

////

# Пересобрать только сервер

docker-compose build --no-cache server

# Перезапустить только сервер

docker-compose up -d server

# Проверить логи

docker-compose logs -f server

/////

# Проверить, что API отвечает

curl -I https://hammasiuy.com/api

# Проверить статус всех контейнеров

docker-compose ps

# Проверить использование ресурсов

docker stats

//////

# Посмотреть детальные логи

docker-compose logs -f

# Проверить конфигурацию nginx

docker-compose exec nginx nginx -t

# Перезапустить nginx

docker-compose restart nginx

//////

getMyProperties теперь надо отправлять token




<!-- gul раздел -->
<!-- пусть homepage сервер добавляет компанию -->