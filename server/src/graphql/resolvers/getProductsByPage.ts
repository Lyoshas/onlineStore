import DBProduct from '../../interfaces/DBProduct';
import DisplayProduct from '../../interfaces/DisplayProduct';
import dbPool from '../../services/postgres.service';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';

function getProductsByPage(
    parent: any,
    args: { page: number }
): Promise<DisplayProduct[]> {
    const productsPerPage: number = parseInt(
        process.env.PRODUCTS_PER_PAGE as string
    );

    return dbPool
        .query<DBProduct>(`
            SELECT
                id,
                title,
                price,
                initial_image_url,
                additional_image_url,
                quantity_in_stock,
                short_description
            FROM products
            OFFSET $1
            LIMIT $2
        `, [
            productsPerPage * (+args.page - 1),
            productsPerPage,
        ])
        .then(({ rows }) => {
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
        });
}

export default getProductsByPage;
