import DBProduct from '../../interfaces/DBProduct';
import dbPool from '../../services/postgres.service';

// it should return the id of the newly created product
export default async function createProduct(
    productInfo: Omit<DBProduct, 'id'>
): Promise<number> {
    const { title, price, previewURL, quantityInStock } = productInfo;
    return dbPool.query(`
        INSERT INTO products (title, price, preview_url, quantity_in_stock)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `, [title, price, previewURL, quantityInStock])
        .then(({ rows }) => rows[0].id as number);
}
