import camelCaseToSnakeCase from './camelCaseToSnakeCase.js';

export type GetRelevantProductFieldsInput = (
    | 'id'
    | 'title'
    | 'price'
    | 'initialImageUrl'
    | 'additionalImageUrl'
    | 'initialImageName'
    | 'additionalImageName'
    | 'isAvailable'
    | 'isRunningOut'
    | 'shortDescription'
    | 'category'
    | 'maxOrderQuantity'
    | 'quantityInStock'
    // 'isInTheCart', 'initialImageName', 'additionalImageName', '__typename' will be ignored
    | 'isInTheCart'
    | 'initialImageName'
    | 'additionalImageName'
    | '__typename'
)[];

// Examples:
// prefixProductField('id') => 'products.id'
// prefixProductField('title') => 'products.title'
const prefixProductField = <T extends string>(
    productField: T
): `products.${T}` => {
    return `products.${productField}`;
};

// Examples:
// prefixCategoryField('id') => 'product_categories.id'
// prefixCategoryField('title') => 'product_categories.title'
const prefixCategoryField = <T extends string>(
    productField: T
): `product_categories.${T}` => {
    return `product_categories.${productField}`;
};

// this function is used to find which product fields we need to fetch from the DB
// when a user requests which product fields they want to get, we need to translate it to the fields that are stored in the DB
const getRelevantProductFields = (
    requestedFields: GetRelevantProductFieldsInput
): string[] => {
    let dbFields = new Set<string>();

    for (let requestedField of requestedFields) {
        if (
            [
                'isInTheCart',
                'initialImageName',
                'additionalImageName',
                '__typename',
            ].includes(requestedField)
        ) {
            continue;
        }

        switch (requestedField) {
            case 'isAvailable':
            case 'isRunningOut':
                dbFields.add(prefixProductField('quantity_in_stock'));
                break;
            case 'initialImageName':
                dbFields.add(prefixProductField('initial_image_url'));
                break;
            case 'additionalImageName':
                dbFields.add(prefixProductField('additional_image_url'));
                break;
            case 'category':
                dbFields.add(
                    prefixCategoryField(camelCaseToSnakeCase(requestedField))
                );
                break;
            default:
                dbFields.add(
                    prefixProductField(camelCaseToSnakeCase(requestedField))
                );
                break;
        }
    }

    return Array.from(dbFields);
};

export default getRelevantProductFields;
