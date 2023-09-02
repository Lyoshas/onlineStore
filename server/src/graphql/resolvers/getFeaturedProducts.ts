import dbPool from '../../services/postgres.service.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import DBProduct from '../../interfaces/DBProduct.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import getProductQuery from '../helpers/getProductQuery.js';

// this function should get featured (or most popular) products,
// but for now we're going to only get 12 random products
async function getFeaturedProducts(
    parent: any,
    args: void
): Promise<DisplayProduct[]> {
    // get 12 random products
    const { rows } = await dbPool.query<Omit<DBProduct, 'max_order_quantity'>>(
        getProductQuery('ORDER BY RANDOM() LIMIT 12')
    );

    return rows.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        initialImageUrl: product.initial_image_url,
        additionalImageUrl: product.additional_image_url,
        shortDescription: product.short_description,
        isAvailable: isProductAvailable(product.quantity_in_stock),
        isRunningOut: isProductRunningOut(product.quantity_in_stock),
    }));
}

export default getFeaturedProducts;
