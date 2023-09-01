import { productCategoryExists } from '../../models/product-category.js';
import CategoryNotExistsError from '../errors/CategoryNotExistsError.js';

const checkProductCategory = async (category: string) => {
    if (!(await productCategoryExists(category))) {
        throw new CategoryNotExistsError();
    }
};

export default checkProductCategory;
