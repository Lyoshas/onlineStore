import DBProduct from '../../interfaces/DBProduct';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties';
import dbPool from '../../services/postgres.service';

// it should return the id of the newly created product
export default async function createProduct(
    productInfo: Omit<CamelCaseProperties<DBProduct>, 'id'>
): Promise<number> {
    const {
        title,
        price,
        initialImageUrl,
        additionalImageUrl,
        quantityInStock,
        shortDescription,
    } = productInfo;

    return dbPool
        .query(
            `
        INSERT INTO products (
            title,
            price,
            initial_image_url,
            additional_image_url,
            quantity_in_stock,
            short_description
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `,
            [
                title,
                price,
                initialImageUrl,
                additionalImageUrl,
                quantityInStock,
                shortDescription,
            ]
        )
        .then(({ rows }) => rows[0].id as number);
}
