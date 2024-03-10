import CartProduct from '../../../interfaces/CartProduct';

export default interface CheckoutInitialValues {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    additionalEmailError?: string;
    paymentMethod: string;
    city: string;
    deliveryMethod: {
        postalService: string;
        office: string;
    };
    orderProducts: Omit<CartProduct, 'canBeOrdered'>[];
}
