#!/bin/sh

API_HOST="nginx"
API_PORT="80"
# nginx returns 502 if the upstream server isn't responding
EXPECTED_STATUS=502

# if the status code is equal to 502 (bad gateway) or if the exit code is equal to 7, run the next iteration
# otherwise break
while true; do
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${API_HOST}:${API_PORT}/api/graphql")
    EXIT_CODE=$?

    # exit code 7 means that the "client" container failed to connect to nginx
    # in probably all cases this is because the "client" container started earlier than nginx
    # exit code 6 means that the address of the given server could not be resolved
    if [ $EXIT_CODE -ne 7 ] && [ $EXIT_CODE -ne 6 ] && [ $STATUS_CODE -ne $EXPECTED_STATUS ]; then
        break
    fi

    echo "Waiting for API to be ready..."
    sleep 5
done

# run the command specified as arguments
exec "$@"
