import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import DBProduct from '../../interfaces/DBProduct.js';
import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties.js';
import getProductQuery from '../helpers/getProductQuery.js';
import { getObjectKeyByImageUrl } from '../../models/amazon-s3.js';

type GetAdminProductOutput = CamelCaseProperties<DBProduct> & {
    initialImageName: string;
    additionalImageName: string;
};

const getAdminProduct = async (
    _: any,
    args: { productId: number },
    context: ApolloServerContext
): Promise<GetAdminProductOutput> => {
    await validateUser(context.user);

    const { rows } = await dbPool.query<DBProduct>(
        getProductQuery('WHERE id = $1'),
        [args.productId]
    );

    const product = rows[0];

    return {
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        initialImageUrl: product.initial_image_url,
        additionalImageUrl: product.additional_image_url,
        initialImageName: getObjectKeyByImageUrl(product.initial_image_url),
        additionalImageName: getObjectKeyByImageUrl(product.additional_image_url),
        quantityInStock: product.quantity_in_stock,
        shortDescription: product.short_description,
    };
};

export default getAdminProduct;
