import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import authSlice from './slices/auth';
import errorSlice from './slices/error';
import { authApi } from './apis/authApi';
import { productCategoryApi } from './apis/productCategoryApi';
import { s3PresignedUrlApi } from './apis/s3PresignedApi';
import { s3UploadApi } from './apis/s3UploadApi';
import { cartApi } from './apis/cartApi';

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        error: errorSlice.reducer,
        [authApi.reducerPath]: authApi.reducer,
        [productCategoryApi.reducerPath]: productCategoryApi.reducer,
        [s3PresignedUrlApi.reducerPath]: s3PresignedUrlApi.reducer,
        [s3UploadApi.reducerPath]: s3UploadApi.reducer,
        [cartApi.reducerPath]: cartApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(productCategoryApi.middleware)
            .concat(s3PresignedUrlApi.middleware)
            .concat(s3UploadApi.middleware)
            .concat(cartApi.middleware);
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export default store;
