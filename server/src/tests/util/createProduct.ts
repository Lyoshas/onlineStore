import DBProduct from '../../interfaces/DBProduct';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties';
import dbPool from '../../services/postgres.service';

// it should return the id of the newly created product
export default async function createProduct(
	productInfo: Omit<CamelCaseProperties<DBProduct>, 'id' | 'categoryId'> & {
		category: string;
	}
): Promise<number> {
	const {
		title,
		price,
		initialImageUrl,
		additionalImageUrl,
		quantityInStock,
		shortDescription,
		maxOrderQuantity,
		category,
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
                short_description,
                max_order_quantity,
                category_id
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                (
                    SELECT id FROM product_categories WHERE category = $8
                )
            )
            RETURNING id
            `,
			[
				title,
				price,
				initialImageUrl,
				additionalImageUrl,
				quantityInStock,
				shortDescription,
				maxOrderQuantity,
				category,
			]
		)
		.then(({ rows }) => rows[0].id as number);
}
