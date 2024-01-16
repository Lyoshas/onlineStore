import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HighlightCartState {
    shouldHighlightCart: boolean;
}

const initialState: HighlightCartState = {
    shouldHighlightCart: false,
};

/**
 * This slice is used to share a "shouldHighlightCart" property with components.
 * When "shouldHighlightCart" is "true", the cart button should play a short
 * amination to attract the user's attention.
 * When "shouldHIghlightCart" is "false", it's possible to initiate the
 * animation again by setting this property to "true"
 */
const highlightCartSlice = createSlice({
    name: 'highlightCart',
    initialState,
    reducers: {
        changeHighlightState(state, action: PayloadAction<boolean>) {
            state.shouldHighlightCart = action.payload;
        },
    },
});

export const highlightCartActions = highlightCartSlice.actions;

export default highlightCartSlice;
