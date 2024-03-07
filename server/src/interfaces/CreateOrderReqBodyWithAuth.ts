export default interface CreateOrderReqBodyWithAuth {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    paymentMethod: string;
    city: string;
    deliveryWarehouse: string;
}
