import dbPool from '../../util/database';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';

export default (parent: any, args: { page: number }) => {
    const productsPerPage: number = parseInt(
        process.env.PRODUCTS_PER_PAGE as string
    );

    return dbPool.query(
        'SELECT * FROM products OFFSET $1 LIMIT $2',
        [productsPerPage * (+args.page - 1), productsPerPage]
    ).then(({ rows }) => {
        return rows.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price,
            previewURL: product.preview_url,
            isAvailable: isProductAvailable(product.quantity_in_stock),
            isRunningOut: isProductRunningOut(product.quantity_in_stock)
        }));
    });
};
