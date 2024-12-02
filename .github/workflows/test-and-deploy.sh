#!/bin/bash

# SCRIPT_DIR зберігає положення цього .sh-файлу
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# ми не знаємо точно з якої директорії був викликаний цей скрипт,
# тому робимо "cd" до папки, де знаходиться цей скрипт
cd "${SCRIPT_DIR}"
# переходимо до папки всього проєкту
cd ../..

# запускаємо Docker контейнер для PostgreSQL
docker compose -f docker-compose-test.yml up --build -d postgres
# даємо 10 секунд для запуску PostgreSQL
sleep 10s

# встановимо залежності для API-серверу (це необхідно для запуску міграцій для локальної PostgreSQL)
cd ./server
npm install
# запускаємо міграції (це необхідно буде для тестування API-застосунку)
npm run db:migrate:up

# переходимо в папку всього проєкту
cd ..
# запускаємо контейнер, який тестує API-застосунок, додатково піднімаємо усі залежності API-серверу
docker compose -f docker-compose-test.yml up --build -d
# дамо 10 секунд на запуск залежностей та проведення тестів
sleep 10s
# збираємо exit code для контейнеру, який проводив тести API-серверу
TEST_CONTAINER_EXIT_CODE=$(docker inspect \
    "$(docker ps --all | grep api-test | grep -E -o '^[a-z0-9]+')" \
    --format='{{.State.ExitCode}}')

# якщо exit code контейнеру, який проводив тесту API-серверу, дорівнює 0, усі тести пройшли успішно
if [ "${TEST_CONTAINER_EXIT_CODE}" -eq "0" ]; then
    echo "Тестування застосунку пройшло успішно"
    # розгортаємо API-застосунок до Amazon ECS
    cd ./server
    # логінимося до Elastic Container Registry (ECR)
    aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 941377122569.dkr.ecr.eu-central-1.amazonaws.com
    # будуємо зображення (docker image) для API-застосунку
    docker build -t onlinestore/api .
    # додаємо додатковий тег для подальшого пушу зображення до ECR
    docker tag onlinestore/api:latest 941377122569.dkr.ecr.eu-central-1.amazonaws.com/onlinestore/api:latest
    # пушимо побудоване зображення до ECR
    docker push 941377122569.dkr.ecr.eu-central-1.amazonaws.com/onlinestore/api:latest

    # оновлюємо сервіс ECS ("сервіс" у даному випадку - це компонент ECS, який керує запуском та масштабуванням контейнерів у ECS-кластері)
    aws ecs update-service \
        --cluster onlinestore-ecs-cluster \
        --service online-store-infra-EcsRESTfulApiService-xNHucbS8WA3o \
        --task-definition online-store-infra-EcsTaskDefinition-EXsX3hgk51Wu \
        --force-new-deployment > /dev/null
else
    echo "Тестування пройшло неуспішно (exit status $?)"
    # показуємо логи контейнера, який проводив тестування API-серверу для подальшого дебагу
    docker compose -f docker-compose-test.yml logs api-test
fi

# зупиняємо усі запущені контейнери
cd "${SCRIPT_DIR}"
cd ../..
docker compose -f docker-compose-test.yml down
