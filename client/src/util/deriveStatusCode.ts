import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

function deriveStatusCode(
    rtkError: FetchBaseQueryError | SerializedError | undefined
): number | null {
    return rtkError && 'data' in rtkError && typeof rtkError.status === 'number'
        ? rtkError.status
        : null;
}

export default deriveStatusCode;
