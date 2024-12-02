import { createApi } from '@reduxjs/toolkit/query/react';
import createBaseQuery from '../util/createBaseQuery';

export const backendApi = createApi({
	reducerPath: 'backendApi',
	tagTypes: [
		'CartItemCount',
		'GetCart',
		'DisplayOrderList',
		'CheckOrderFeasibility',
	],
	baseQuery: createBaseQuery({
		baseUrl: process.env.NODE_ENV === 'development'
			? '/api'
			: 'https://api.onlinestore-potapchuk.click',
		includeAccessToken: true,
	}),
	endpoints: () => ({}),
});
