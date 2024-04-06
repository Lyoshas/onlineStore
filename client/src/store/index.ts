import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import authSlice from './slices/auth';
import errorSlice from './slices/error';
import { s3UploadApi } from './apis/s3UploadApi';
import cartModalSlice from './slices/cartModal';
import highlightCartSlice from './slices/highlightCart';
import localCartSlice, { persistLocalCartMiddleware } from './slices/localCart';
import { backendApi } from './apis/backendApi';

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        error: errorSlice.reducer,
        cartModal: cartModalSlice.reducer,
        localCart: localCartSlice.reducer,
        highlightCart: highlightCartSlice.reducer,
        [backendApi.reducerPath]: backendApi.reducer,
        [s3UploadApi.reducerPath]: s3UploadApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware()
            .concat(backendApi.middleware)
            .concat(s3UploadApi.middleware)
            .concat(persistLocalCartMiddleware);
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export default store;
