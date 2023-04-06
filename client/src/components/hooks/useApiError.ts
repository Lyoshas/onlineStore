import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';

import { errorActions } from '../../store/slices/error';
import deriveStatusCode from '../../util/deriveStatusCode';
import ServerErrorResponse from '../../interfaces/ServerErrorResponse';

interface ExpectedErrorResponse {
    statusCode: number;
    serverResponse: ServerErrorResponse;
}

const useApiError = (
    isError: boolean,
    error: FetchBaseQueryError | SerializedError | undefined,
    // an array of numbers, where each number is an expected status code
    // for example [403, 422]. If the status code is not in this array,
    // a generic error will shown to the user (like "Something went wrong")
    expectedErrorStatusCodes: number[]
) => {
    const dispatch = useDispatch();
    const [expectedErrorResponse, setExpectedErrorResponse] =
        useState<ExpectedErrorResponse | null>(null);

    useEffect(() => {
        if (!isError) return;

        const statusCode = deriveStatusCode(error);

        if ('data' in error! && expectedErrorStatusCodes.includes(statusCode!)) {
            setExpectedErrorResponse({
                statusCode: statusCode!,
                serverResponse: error.data as ServerErrorResponse,
            });

            return;
        }

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong. Please try reloading the page.'
            )
        );
    }, [isError, error]);

    return expectedErrorResponse;
};

export default useApiError;
