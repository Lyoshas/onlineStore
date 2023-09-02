import DBProduct from '../../interfaces/DBProduct.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import dbPool from '../../services/postgres.service.js';
import getProductQuery from '../helpers/getProductQuery.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import { PageOutOfRangeError } from '../errors/PageOutOfRangeError.js';

interface GetProductsByPageResult {
    productList: DisplayProduct[];
    totalPages: number;
}

async function getTotalPages(productsPerPage: number): Promise<number> {
    const { rows } = await dbPool.query<{ total_products: number }>(
        'SELECT COUNT(id) AS total_products FROM products'
    );
    return Math.ceil(rows[0].total_products / productsPerPage);
}

async function getProductsByPage(
    parent: any,
    args: { page: number }
): Promise<GetProductsByPageResult> {
    if (args.page <= 0) {
        throw new PageOutOfRangeError();
    }

    const productsPerPage: number = parseInt(
        process.env.PRODUCTS_PER_PAGE as string
    );

    const { rows } = await dbPool.query<Omit<DBProduct, 'max_order_quantity'>>(
        getProductQuery('OFFSET $1 LIMIT $2'),
        [productsPerPage * (+args.page - 1), productsPerPage]
    );

    return {
        productList: rows.map((product) => ({
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
            initialImageUrl: product.initial_image_url,
            additionalImageUrl: product.additional_image_url,
            shortDescription: product.short_description,
            isAvailable: isProductAvailable(product.quantity_in_stock),
            isRunningOut: isProductRunningOut(product.quantity_in_stock),
        })),
        totalPages: await getTotalPages(productsPerPage),
    };
}

export default getProductsByPage;
