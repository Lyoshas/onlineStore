import DBProduct from '../../interfaces/DBProduct';
import arrayIntersection from './arrayIntersection.js';
import camelCaseToSnakeCase from './camelCaseToSnakeCase.js';

// this function is used to find which product fields we need to fetch from the DB
const getRelevantProductFields = (requestedFields: string[]): string[] => {
    const productFields: (keyof DBProduct)[] = [
        'id',
        'title',
        'price',
        'initial_image_url',
        'additional_image_url',
        'quantity_in_stock',
        'short_description',
        'category',
        'max_order_quantity',
    ];

    let relevantFields = arrayIntersection(
        productFields,
        requestedFields.map((field) => camelCaseToSnakeCase(field))
    );

    // 'initialImageName' and 'additionalImageName' aren't in the DB, we need to derive these from the image URLs
    // so if the user requested 'initialImageName' or 'additionalImageName', we need to fetch 'initialImageUrl' and/or 'additionalImageUrl' from the DB
    if (
        requestedFields.includes('initialImageName') &&
        !relevantFields.includes('initial_image_url')
    )
        relevantFields.push('initial_image_url');

    if (
        requestedFields.includes('additionalImageName') &&
        !relevantFields.includes('additional_image_url')
    )
        relevantFields.push('additional_image_url');

    // if the user requested 'isAvailable' or 'isRunningOut', we need to fetch 'quantity_in_stock' from the DB
    if (
        (requestedFields.includes('isAvailable') ||
            requestedFields.includes('isRunningOut')) &&
        !relevantFields.includes('quantity_in_stock')
    )
        relevantFields.push('quantity_in_stock');

    return relevantFields;
};

export default getRelevantProductFields;
