import CreateOrderReqBodyWithAuth from './CreateOrderReqBodyWithAuth';
import OrderProduct from './OrderProduct';

interface CreateOrderReqBodyNoAuth extends CreateOrderReqBodyWithAuth {
    email: string;
    orderProducts: OrderProduct[];
}

export default CreateOrderReqBodyNoAuth;
