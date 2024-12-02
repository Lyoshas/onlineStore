import { it, expect, describe } from 'vitest';
import supertest from 'supertest';
import { createUserAndReturnAccessToken } from './util/createUser';
import app from '../app.js';
import createProduct from './util/createProduct.js';
import { createProductCategoryIfNotExists } from './util/createProductCategory.js';

const request = supertest(app);

describe('adding a new product to the cart', async () => {
	it('should add an in-stock product to the cart', async () => {
		const accessToken: string = await createUserAndReturnAccessToken({
			isAdmin: true,
			isActivated: true,
		});
		const productCategory = 'Ноутбуки';
		await createProductCategoryIfNotExists(productCategory);
		const productId = await createProduct({
			title: 'Новий товар',
			price: 19999,
			category: productCategory,
			initialImageUrl: 'test.com',
			additionalImageUrl: 'test.com',
			maxOrderQuantity: 5,
			quantityInStock: 5,
			shortDescription: 'Гарний ноутбук',
		});

		const response = await request
			.put('/user/cart')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				productId,
				quantity: 2,
			});

		expect(response.status).toBe(204);
	});
});
