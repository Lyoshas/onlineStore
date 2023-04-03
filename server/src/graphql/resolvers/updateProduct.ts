import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import DBProduct from '../../interfaces/DBProduct';
import isProductRunningOut from '../helpers/isProductRunningOut';
import isProductAvailable from '../helpers/isProductAvailable';
import ApolloServerContext from '../../interfaces/ApolloServerContext';

export default async (
    _: any,
    args: DBProduct,
    context: ApolloServerContext
) => {
    await validateUser(context.user);

    const { id, title, price, previewURL, quantityInStock } = args;
    let i = 0;

    const isTitleCorrect = typeof title === 'string';
    const isPriceCorrect = typeof price === 'number';
    const isPreviewURLCorrect = typeof previewURL === 'string';
    const isQuantityInStockCorrect = typeof quantityInStock === 'number';

    if ([
        isTitleCorrect,
        isPriceCorrect,
        isPreviewURLCorrect,
        isQuantityInStockCorrect
    ].every(val => !val)) {
        throw new Error(
            'At least one of these fields ' +
            '("title", "price", "previewURL" and "quantityInStock") ' +
            'must be specified'
        )
    }

    const { rowCount } = await dbPool.query(
        `UPDATE products
        SET
            ${isTitleCorrect ? `title = $${++i},` : ''}
            ${isPriceCorrect ? `price = $${++i},` : ''}
            ${isPreviewURLCorrect ? `preview_url = $${++i},` : ''}
            ${isQuantityInStockCorrect ? `quantity_in_stock = $${++i}` : ''}
        WHERE id = $${++i}`,
        [
            isTitleCorrect ? title : null,
            isPriceCorrect ? price : null,
            isPreviewURLCorrect ? previewURL : null,
            isQuantityInStockCorrect ? quantityInStock : null,
            id
        ].filter(arg => arg !== null)
    );

    if (rowCount === 0) {
        throw new Error(`Product with id=${id} does not exist`);
    }

    return {
        id,
        title,
        price,
        previewURL,
        isAvailable: isProductAvailable(quantityInStock),
        isRunningOut: isProductRunningOut(quantityInStock)
    };
}