interface CartProduct {
    productId: number;
    title: string;
    price: number;
    initialImageUrl: string;
    quantity: number;
    canBeOrdered: boolean;
}

export default CartProduct;
