import dbPool from '../services/postgres.service';

export const getProductCategories = async (): Promise<string[]> => {
    const { rows } = await dbPool.query<{ category: string }>(
        'SELECT category FROM product_categories'
    );

    return rows.map((row) => row.category);
};
