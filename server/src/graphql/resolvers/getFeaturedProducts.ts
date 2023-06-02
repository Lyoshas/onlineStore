import dbPool from '../../services/postgres.service';
import DisplayProduct from '../../interfaces/DisplayProduct';
import DBProduct from '../../interfaces/DBProduct';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';
import getProductQuery from '../helpers/getProductQuery';

// this function should get featured (or most popular) products,
// but for now we're going to only get 12 random products
async function getFeaturedProducts(
    parent: any,
    args: void
): Promise<DisplayProduct[]> {
    // get 12 random products
    const { rows } = await dbPool.query<DBProduct>(
        getProductQuery('ORDER BY RANDOM() LIMIT 12')
    );

    return rows.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        initialImageUrl: product.initial_image_url,
        additionalImageUrl: product.additional_image_url,
        shortDescription: product.short_description,
        isAvailable: isProductAvailable(product.quantity_in_stock),
        isRunningOut: isProductRunningOut(product.quantity_in_stock),
    }));
}

export default getFeaturedProducts;
