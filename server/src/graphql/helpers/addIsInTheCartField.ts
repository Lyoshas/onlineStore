import { getUserCart } from '../../models/cart.js';

// this function takes a list of product details and appends the "isInTheCart" field into each product
const addIsInTheCartField = async <T extends { id: number }>( // here "id" is as alias for "productId"
    userId: number,
    productList: T[]
): Promise<(T & { isInTheCart: boolean })[]> => {
    // fetching the cart from PostgreSQL or Redis
    // if it's fetched from PostgreSQL, it will be cached to Redis for future calls
    const cart = await getUserCart(userId);

    // "isProductIdInTheCart" will be used to quickly check if a given product id is in the cart or not
    // key - product id; value - whether it's in the cart or not (null - not determined yet)
    const isProductIdInTheCart: { [productId: number]: boolean | undefined } =
        {};
    cart.forEach(
        (cartEntry) => (isProductIdInTheCart[cartEntry.productId] = true)
    );

    return productList.map((product) => ({
        ...product,
        isInTheCart: Boolean(isProductIdInTheCart[product.id]),
    }));
};

export default addIsInTheCartField;
