import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import DBProduct from '../../interfaces/DBProduct.js';
import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties.js';
import { getObjectKeyByImageUrl } from '../../models/amazon-s3.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';

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
        `
            SELECT
                id,
                title,
                price,
                category,
                initial_image_url,
                additional_image_url,
                quantity_in_stock,
                short_description,
                max_order_quantity
            FROM products
            WHERE id = $1
        `,
        [args.productId]
    );

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
        initialImageName: getObjectKeyByImageUrl(product.initial_image_url),
        additionalImageName: getObjectKeyByImageUrl(
            product.additional_image_url
        ),
        quantityInStock: product.quantity_in_stock,
        shortDescription: product.short_description,
        maxOrderQuantity: product.max_order_quantity,
    };
};

export default getAdminProduct;
