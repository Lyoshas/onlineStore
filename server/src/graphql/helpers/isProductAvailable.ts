import DBProduct from '../../interfaces/DBProduct';

/*
    This function returns whether a product is deemed to be available.
    I thought this function would be useful because sometimes
    you wouldn't want to sell a product if there are only a couple of 
    samples left.
    In this case, however, a product is considered available if there is 
    at least 1 sample of it.
*/
function isProductAvailable(
    quantityInStock: DBProduct['quantity_in_stock']
) {
    return quantityInStock > 0;
}

export default isProductAvailable;
