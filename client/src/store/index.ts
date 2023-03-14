import { configureStore } from '@reduxjs/toolkit';

import authSlice from './slices/auth';
import errorSlice from './slices/error';

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        error: errorSlice.reducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
