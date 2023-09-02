import DBProduct from '../../interfaces/DBProduct.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import dbPool from '../../services/postgres.service.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import getProductQuery from '../helpers/getProductQuery.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';

function getProduct(
    parent: any,
    args: { id: number }
): Promise<DisplayProduct> {
    // code to get data from the DB
    return dbPool
        .query<Omit<DBProduct, 'max_order_quantity'>>(
            getProductQuery('WHERE id = $1'),
            [args.id]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                throw new ProductNotFoundError();
            }

            const product = rows[0];
            return {
                id: product.id,
                title: product.title,
                price: product.price,
                category: product.category,
                initialImageUrl: product.initial_image_url,
                additionalImageUrl: product.additional_image_url,
                shortDescription: product.short_description,
                isAvailable: isProductAvailable(product.quantity_in_stock),
                isRunningOut: isProductRunningOut(product.quantity_in_stock),
            };
        });
}

export default getProduct;
