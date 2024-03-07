export default interface OrderSummary {
    orderProducts: {
        productId: number;
        title: string;
        orderQuantity: number;
        price: number;
    }[];
    totalPrice: number;
}
