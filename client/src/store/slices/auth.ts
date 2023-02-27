import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// null - not determined yet
interface AuthState {
    accessToken: string | null;
    isAuthenticated: boolean | null;
}

const initialState: AuthState = { accessToken: null, isAuthenticated: null };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAccessToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
        },
        invalidateUser(state) {
            state.accessToken = '';
            state.isAuthenticated = false;
        },
    },
});

export const authActions = authSlice.actions;

export default authSlice;
