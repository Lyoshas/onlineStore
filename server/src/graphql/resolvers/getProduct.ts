import DBProduct from '../../interfaces/DBProduct';
import DisplayProduct from '../../interfaces/DisplayProduct';
import dbPool from '../../services/postgres.service';
import getProductQuery from '../helpers/getProductQuery';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';

function getProduct(
    parent: any,
    args: { id: number }
): Promise<DisplayProduct> {
    // code to get data from the DB
    return dbPool
        .query<DBProduct>(getProductQuery('WHERE id = $1'), [args.id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                throw new Error('Product not found');
            }

            const product = rows[0];
            return {
                id: product.id,
                title: product.title,
                price: product.price,
                initialImageUrl: product.initial_image_url,
                additionalImageUrl: product.additional_image_url,
                shortDescription: product.short_description,
                isAvailable: isProductAvailable(product.quantity_in_stock),
                isRunningOut: isProductRunningOut(product.quantity_in_stock),
            };
        });
}

export default getProduct;
