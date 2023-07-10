import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { SerializedError } from '@reduxjs/toolkit';

import ServerErrorResponse from '../interfaces/ServerErrorResponse';

const deriveErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
): string | null => {
    return error && 'data' in error
        ? (error.data as ServerErrorResponse).errors[0].message
        : null;
};

export default deriveErrorMessage;
