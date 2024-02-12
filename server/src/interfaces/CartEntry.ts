export default interface CartEntry {
    productId: number;
    title: string;
    price: number;
    initialImageUrl: string;
    quantity: number;
    // a cart product can be ordered if the specified quantity doesn't exceed the stock balance and if the "maxOrderQuantity" limit hasn't been exceeded
    canBeOrdered: boolean;
};
