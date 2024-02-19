import { RootState } from '..';

const calculateCartTotalPrice = (
    cartProducts: RootState['localCart']['products']
): number => {
    return Object.values(cartProducts).reduce((acc, elem) => {
        const product = elem!;
        // if the current cart product is "unavailable", don't include it in the total price
        if (!product.canBeOrdered) {
            return acc;
        }
        return acc + product.price * product.quantity;
    }, 0);
};

export default calculateCartTotalPrice;
