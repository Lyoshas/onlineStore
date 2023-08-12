import dbPool from '../services/postgres.service.js';

export const getProductCategories = async (): Promise<string[]> => {
    const { rows } = await dbPool.query<{ category: string }>(
        'SELECT category FROM product_categories'
    );

    return rows.map((row) => row.category);
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
