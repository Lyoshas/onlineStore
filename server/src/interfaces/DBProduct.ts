import BaseProduct from './BaseProduct';

export default interface DBProduct extends BaseProduct {
    quantityInStock: number;
};
