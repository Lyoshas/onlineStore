import dbPool from '../../services/postgres.service';

// it should return the id of the newly created product
export async function createProductCategoryIfNotExists(
	category: string
): Promise<void> {
	const { rows } = await dbPool.query<{ exists: boolean }>(
		'SELECT EXISTS(SELECT 1 FROM product_categories WHERE category = $1)',
		[category]
	);

	if (rows[0].exists) return;

	await dbPool.query(
		`
            INSERT INTO product_categories (category, preview_url)
            VALUES ($1, $2)
            RETURNING id
        `,
		[category, 'https://test.com']
	);
}
