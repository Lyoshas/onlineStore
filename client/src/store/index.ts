import { configureStore } from '@reduxjs/toolkit';

import authSlice from './slices/auth';
import errorSlice from './slices/error';
import { authApi } from './apis/authApi';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        error: errorSlice.reducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware()
            .concat(authApi.middleware);
    }
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export default store;
