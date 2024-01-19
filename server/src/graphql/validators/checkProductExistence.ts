import { productExists } from '../../models/product.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';

const checkProductExistence = async (productId: number) => {
    if (!(await productExists(productId))) {
        throw new ProductNotFoundError();
    }
};

export default checkProductExistence;
