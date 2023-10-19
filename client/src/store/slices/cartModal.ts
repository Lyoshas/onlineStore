import { createSlice } from '@reduxjs/toolkit';

interface CartModalState {
    isCartModalShown: boolean;
}

const initialState: CartModalState = {
    isCartModalShown: false,
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
    },
});

export const cartModalActions = cartModalSlice.actions;

export default cartModalSlice;
