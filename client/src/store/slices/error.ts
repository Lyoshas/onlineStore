import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ErrorState {
    isErrorNotificationShown: boolean;
    errorMessage: string;
}

const initialState: ErrorState = {
    isErrorNotificationShown: false,
    errorMessage: ''
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        showNotificationError(state, action: PayloadAction<string>) {
            state.isErrorNotificationShown = true;
            state.errorMessage = action.payload;
        },
        hideNotificationError(state) {
            state.isErrorNotificationShown = false;
            state.errorMessage = '';
        }
    }
});

export const errorActions = errorSlice.actions;

export default errorSlice;
