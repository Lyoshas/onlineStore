import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

import AccessTokenPayload from '../../interfaces/AccessTokenPayload';

// null - not determined yet
interface AuthState {
    accessToken: string | null;
    isAuthenticated: boolean | null;
    isAdmin: boolean | null;
}

const initialState: AuthState = {
    accessToken: null,
    isAuthenticated: null,
    isAdmin: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAccessToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
            
            // if we have the access token, we can start decrypting it
            // since we got this token from the API server, we can trust the data that's in it
            // moreover, the server won't allow any unauthorized operations
            const encoded: AccessTokenPayload = jwt_decode(action.payload);
            state.isAdmin = encoded.isAdmin;
        },
        invalidateUser(state) {
            state.accessToken = '';
            state.isAuthenticated = false;
            state.isAdmin = false;
        },
    },
});

export const authActions = authSlice.actions;

export default authSlice;
