// takes a product's quantity and returns whether it's running out
// in this case if there are 5 products or less,

import DBProduct from '../../interfaces/DBProduct.js';

// this product is assummed to be running out
function isProductRunningOut(quantityInStock: DBProduct['quantity_in_stock']) {
    return quantityInStock <= 5;
}

export default isProductRunningOut;
