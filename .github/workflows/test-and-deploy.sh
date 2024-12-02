#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# TESTING THE APPLICATION

cd "${SCRIPT_DIR}"
cd ../..

# we are in the onlineStore folder
docker compose -f docker-compose-test.yml up --build -d postgres
sleep 10s
cd ./server
# we are in the server folder
npm install
npm run db:migrate:up

cd ..
# we are in the onlineStore folder
docker compose -f docker-compose-test.yml up --build -d
sleep 10s
TEST_CONTAINER_EXIT_CODE=$(docker inspect \
    "$(docker ps --all | grep api-test | grep -E -o '^[a-z0-9]+')" \
    --format='{{.State.ExitCode}}')

if [ "${TEST_CONTAINER_EXIT_CODE}" -eq "0" ]; then
    echo "Тестування застосунку пройшло успішно"
    # DEPLOYING THE APPLICATION
    cd ./server
    aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 941377122569.dkr.ecr.eu-central-1.amazonaws.com
    docker build -t onlinestore/api .
    docker tag onlinestore/api:latest 941377122569.dkr.ecr.eu-central-1.amazonaws.com/onlinestore/api:latest
    docker push 941377122569.dkr.ecr.eu-central-1.amazonaws.com/onlinestore/api:latest

    # UPDATING ECS
    aws ecs update-service \
        --cluster onlinestore-ecs-cluster \
        --service online-store-infra-EcsRESTfulApiService-xNHucbS8WA3o \
        --task-definition online-store-infra-EcsTaskDefinition-EXsX3hgk51Wu \
        --force-new-deployment > /dev/null
else
    echo "Тестування пройшло неуспішно (exit status $?)"
    docker compose -f docker-compose-test.yml logs api-test
fi

cd "${SCRIPT_DIR}"
cd ../..
# we are in the onlineStore folder
docker compose -f docker-compose-test.yml down


