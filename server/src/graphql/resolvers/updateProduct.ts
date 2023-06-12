import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import DBProduct from '../../interfaces/DBProduct';
import isProductRunningOut from '../helpers/isProductRunningOut';
import isProductAvailable from '../helpers/isProductAvailable';
import ApolloServerContext from '../../interfaces/ApolloServerContext';
import DisplayProduct from '../../interfaces/DisplayProduct';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties';

export default async (
    _: any,
    args: CamelCaseProperties<DBProduct>,
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    await validateUser(context.user);

    const {
        id,
        title,
        price,
        category,
        initialImageUrl,
        additionalImageUrl,
        shortDescription,
        quantityInStock,
    } = args;
    let i = 0;

    const isTitleCorrect = typeof title === 'string';
    const isPriceCorrect = typeof price === 'number';
    const isCategoryCorrect = typeof category === 'string';
    const isInitialImageUrlCorrect = typeof initialImageUrl === 'string';
    const isAdditionalImageUrlCorrect = typeof additionalImageUrl === 'string';
    const isShortDescriptionCorrect = typeof shortDescription === 'string';
    const isQuantityInStockCorrect = typeof quantityInStock === 'number';

    if (
        [
            isTitleCorrect,
            isPriceCorrect,
            isInitialImageUrlCorrect,
            isAdditionalImageUrlCorrect,
            isShortDescriptionCorrect,
            isQuantityInStockCorrect,
        ].every((val) => !val)
    ) {
        throw new Error(
            'At least one of these fields ("title", "price", "initialImageUrl", "additionalImageUrl", "shortDescription", and "quantityInStock") must be specified'
        );
    }

    const { rowCount } = await dbPool.query(
        `UPDATE products
        SET
            ${isTitleCorrect ? `title = $${++i},` : ''}
            ${isPriceCorrect ? `price = $${++i},` : ''}
            ${isCategoryCorrect ? `category = $${++i},` : ''}
            ${isInitialImageUrlCorrect ? `initial_image_url = $${++i},` : ''}
            ${isAdditionalImageUrlCorrect ? `additional_image_url = $${++i},` : ''}
            ${isShortDescriptionCorrect ? `short_description = $${++i},` : ''}
            ${isQuantityInStockCorrect ? `quantity_in_stock = $${++i}` : ''}
        WHERE id = $${++i}`,
        [
            isTitleCorrect ? title : null,
            isPriceCorrect ? price : null,
            isCategoryCorrect ? category : null,
            isInitialImageUrlCorrect ? initialImageUrl : null,
            isAdditionalImageUrlCorrect ? additionalImageUrl : null,
            isShortDescriptionCorrect ? shortDescription : null,
            isQuantityInStockCorrect ? quantityInStock : null,
            id,
        ].filter((arg) => arg !== null)
    );

    if (rowCount === 0) {
        throw new Error(`Product with id=${id} does not exist`);
    }

    return {
        id,
        title,
        price,
        category,
        initialImageUrl,
        additionalImageUrl,
        shortDescription,
        isAvailable: isProductAvailable(quantityInStock),
        isRunningOut: isProductRunningOut(quantityInStock),
    };
};
