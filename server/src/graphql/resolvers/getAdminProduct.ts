import ApolloServerContext from '../../interfaces/ApolloServerContext';
import DBProduct from '../../interfaces/DBProduct';
import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties';
import getProductQuery from '../helpers/getProductQuery';
import getImageName from '../helpers/getImageName';

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
        initialImageName: getImageName(product.initial_image_url),
        additionalImageName: getImageName(product.additional_image_url),
        quantityInStock: product.quantity_in_stock,
        shortDescription: product.short_description,
    };
};

export default getAdminProduct;
