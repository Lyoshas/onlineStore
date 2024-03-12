import CartProduct from '../interfaces/CartProduct';

const getEligibleCartProducts = (cartProducts: {
    [productId: string]: CartProduct | undefined;
}) => {
    return Object.values(cartProducts)
        .filter((cartProduct) => cartProduct!.canBeOrdered)
        .map((cartProduct) => ({
            productId: cartProduct!.productId,
            title: cartProduct!.title,
            price: cartProduct!.price,
            initialImageUrl: cartProduct!.initialImageUrl,
            quantity: cartProduct!.quantity,
        }));
};

export default getEligibleCartProducts;
