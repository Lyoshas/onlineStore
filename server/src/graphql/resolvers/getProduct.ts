import dbPool from '../../util/database';

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
            isAvailable: product.quantity_in_stock > 1,
            isRunningOut: product.quantity_in_stock <= 5
        };
    });
};
