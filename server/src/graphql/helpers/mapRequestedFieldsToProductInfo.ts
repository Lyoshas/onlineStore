import DBProduct from '../../interfaces/DBProduct.js';
import { getObjectKeyByImageUrl } from '../../models/amazon-s3.js';
import camelCaseToSnakeCase from './camelCaseToSnakeCase.js';
import isProductAvailable from './isProductAvailable.js';
import isProductRunningOut from './isProductRunningOut.js';

export type PossibleResolverField =
    | 'id'
    | 'title'
    | 'price'
    | 'category'
    | 'initialImageUrl'
    | 'additionalImageUrl'
    | 'initialImageName'
    | 'additionalImageName'
    | 'quantityInStock'
    | 'shortDescription'
    | 'maxOrderQuantity'
    | 'isAvailable'
    | 'isRunningOut'
    | 'isInTheCart';

type ResolverOutput = Partial<{
    [prop in PossibleResolverField]: unknown;
}>;

// after constructing a dynamic SQL query we need to map requested GraphQL fields to actual values
// this function does just that
// T - specifies which fields the user requested
// productInfo - actual data from the DB
const mapRequestedFieldsToProductInfo = <T extends PossibleResolverField[]>(
    productInfo: Partial<
        DBProduct & { is_in_the_cart: boolean; category: string }
    >,
    requestedFields: T
): ResolverOutput => {
    const objectToReturn: Partial<ResolverOutput> = {};

    for (let requestedField of requestedFields) {
        const value =
            requestedField === 'initialImageName'
                ? getObjectKeyByImageUrl(productInfo.initial_image_url!)
                : requestedField === 'additionalImageName'
                ? getObjectKeyByImageUrl(productInfo.additional_image_url!)
                : requestedField === 'isAvailable'
                ? isProductAvailable(productInfo.quantity_in_stock!)
                : requestedField === 'isRunningOut'
                ? isProductRunningOut(productInfo.quantity_in_stock!)
                : productInfo[
                      camelCaseToSnakeCase<typeof requestedField>(
                          requestedField
                      )
                  ];

        objectToReturn[requestedField] = value;
    }

    return objectToReturn as ResolverOutput;
};

export default mapRequestedFieldsToProductInfo;
