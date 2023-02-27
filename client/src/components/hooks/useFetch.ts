import { useState } from 'react';

const useFetch = (
    URL: string,
    // sending the body occurs in sendRequest(jsonBody)
    init: Omit<RequestInit, 'body'> | undefined,
    expectedStatusCode: number
) => {
    const [isRequestLoading, setIsRequestLoading] = useState<boolean>(false);
    const [JSONResponse, setJSONResponse] = useState<any>(null);
    // null - the request hasn't even begun, true/false - the request succeeded/failed
    const [wasRequestSuccessful, setWasRequestSuccessful] = useState<
        boolean | null
    >(null);
    const [unexpectedRequestError, setUnexpectedRequestError] = useState<
        string | null
    >(null);
    // "null" means that the request hasn't been sent yet
    const [statusCode, setStatusCode] = useState<number | null>(null);

    async function sendRequest(requestBody?: object) {
        try {
            setIsRequestLoading(true);

            const response = await fetch(URL, {
                ...init,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                credentials: 'same-origin'
            });
            const data = await response.json();

            setJSONResponse(data);

            setStatusCode(response.status);
            if (response.status !== expectedStatusCode) {
                setWasRequestSuccessful(false);
                return;
            }

            setWasRequestSuccessful(true);
        } catch {
            setWasRequestSuccessful(false);
            setUnexpectedRequestError(
                'Something went wrong while making a request. We are working on solving this problem. Please try reloading the page.'
            );
        } finally {
            setIsRequestLoading(false);
        }
    }

    return {
        isRequestLoading,
        wasRequestSuccessful,
        JSONResponse,
        unexpectedRequestError,
        sendRequest,
        statusCode,
    };
};

export default useFetch;
