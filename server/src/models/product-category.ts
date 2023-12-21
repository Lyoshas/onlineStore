import dbPool from '../services/postgres.service.js';
import ProductCategory from '../interfaces/ProductCategory.js';

export const getProductCategories = async (): Promise<ProductCategory[]> => {
    const { rows } = await dbPool.query<{
        category: string;
        preview_url: string;
    }>('SELECT category, preview_url FROM product_categories');

    return rows.map((row) => ({
        name: row.category,
        previewURL: row.preview_url,
    }));
};

export const productCategoryExists = async (
    category: string
): Promise<boolean> => {
    const { rows } = await dbPool.query(
        'SELECT 1 FROM product_categories WHERE category = $1',
        [category]
    );

    return rows.length > 0;
};
