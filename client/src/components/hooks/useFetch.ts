import { useState } from 'react';

const useFetch = (
    URL: string,
    init: RequestInit | undefined,
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

    async function sendRequest() {
        try {
            setIsRequestLoading(true);

            const response = await fetch(URL, init);
            const data = await response.json();

            setJSONResponse(data);

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
    };
};

export default useFetch;
