// the same query is used to get product information
// this function is used to prevent repeating the same query over and over again
const getProductQuery = (additionalQuery?: string) => {
    return `
        SELECT
            id,
            title,
            price,
            category,
            initial_image_url,
            additional_image_url,
            quantity_in_stock,
            short_description
        FROM products
    ` + (additionalQuery || '');
};

export default getProductQuery;
