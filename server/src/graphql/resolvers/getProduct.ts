import dbPool from '../../services/postgres.service';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';

export default (parent: any, args: { id: number }) => {
    // code to get data from the DB
    return dbPool.query(
        'SELECT * FROM products WHERE id = $1',
        [args.id]
    ).then(({ rows }) => {
        const product = rows[0];
        return {
            id: product.id,
            title: product.title,
            price: product.price,
            previewURL: product.preview_url,
            isAvailable: isProductAvailable(product.quantity_in_stock),
            isRunningOut: isProductRunningOut(product.quantity_in_stock)
        };
    });
};
