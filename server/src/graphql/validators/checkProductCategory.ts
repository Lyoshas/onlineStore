import { productCategoryExists } from '../../models/product-category.js';

const checkProductCategory = async (category: string) => {
    if (!(await productCategoryExists(category))) {
        throw new Error('The specified category does not exist');
    }
};

export default checkProductCategory;
