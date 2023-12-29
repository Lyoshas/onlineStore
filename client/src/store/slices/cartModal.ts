import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';

interface CartModalState {
    isCartModalShown: boolean;
    // 'isCartBeingChangedByAPI' will be used to specify whether ANY request to the API is loading from the cart modal window
    isCartBeingChangedByAPI: boolean;
}

const initialState: CartModalState = {
    isCartModalShown: false,
    isCartBeingChangedByAPI: false,
};

// this slice will be used to display the <CartContentsModal /> component
// it's necessary because if we displayed this modal window only using useState, it wouldn't work with the <MyCartButton /> component, which gets unmounted whenever the user shrinks the page, which in turn causes the cart modal window to disappear
// this is why it's better to handle this modal window in a more centralized manner, using Redux
const cartModalSlice = createSlice({
    name: 'cart-modal',
    initialState,
    reducers: {
        showCartModal(state) {
            state.isCartModalShown = true;
        },
        hideCartModal(state) {
            state.isCartModalShown = false;
        },
        setIsApiRequestLoading(state, action: PayloadAction<boolean>) {
            state.isCartBeingChangedByAPI = action.payload;
        },
    },
});

export const cartModalActions = cartModalSlice.actions;

export default cartModalSlice;
