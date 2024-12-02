import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { GraphQLFormattedError } from 'graphql';
import cookieParser from 'cookie-parser';

const NODE_ENV = process.env.NODE_ENV as string;

console.log(NODE_ENV);

if (!['development', 'test', 'production'].includes(NODE_ENV)) {
	throw new Error(
		`
        Environment variable NODE_ENV is neither
             'development', nor 'test', nor 'production'
    `.replace(/[\n\t]|\s{2}/g, '')
	);
}

import signinRoutes from './routes/signin.js';
import signupRoutes from './routes/signup.js';
import accountActivationRoutes from './routes/account-activation.js';
import resetPasswordRoutes from './routes/reset-password.js';
import oauthRoutes from './routes/oauth.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import logoutRoutes from './routes/logout.js';
import identifyUser from './middlewares/identify-user.js';
import { typeDefs, resolvers } from './graphql/schema.js';
import ApolloServerContext from './interfaces/ApolloServerContext.js';
import errorHandler from './middlewares/error-handler.js';
import notFoundHandler from './middlewares/not-found-handler.js';
import productCategoriesRoutes from './routes/product-category.js';
import s3Routes from './routes/file-upload.js';
import shippingRoutes from './routes/shipping.js';
import userRoutes from './routes/user.js';
import warrantyRequestRoutes from './routes/warranty-request.js';
import fundraisingCampaignRoutes from './routes/fundraising-campaign.js';
import healthRoutes from './routes/health.js';
import corsHandler from './middlewares/cors-handler.js';
import { requestLogger } from './middlewares/request-logger.js';
import { logger } from './loggers/logger.js';

const app = express();

app.use(requestLogger);

app.use(corsHandler);

app.use(bodyParser.json({ limit: '5kb' }));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false, limit: '5kb' }));

app.use(identifyUser);

app.use('/auth', [
	signinRoutes,
	signupRoutes,
	accountActivationRoutes,
	resetPasswordRoutes,
	oauthRoutes,
	logoutRoutes,
]);

app.use('/user', [cartRoutes, orderRoutes, userRoutes, warrantyRequestRoutes]);

app.use('/', fundraisingCampaignRoutes);

app.use('/product', productCategoriesRoutes);

app.use('/s3', s3Routes);

app.use('/shipping', shippingRoutes);

app.use('/', healthRoutes);

app.get('/test', (req, res, next) => {
	res.json({ message: 'Новий ендпоінт! (пуш в прод успішний)' });
});

// ендпоінт, який блокує Event Loop та нагружає процесор
app.post('/block-event-loop', (req, res, next) => {
	const durationSeconds = +req.body.durationSeconds;
	if (
		!Number.isInteger(durationSeconds) ||
		durationSeconds < 0 ||
		durationSeconds > 300
	) {
		return res.json({
			message: 'durationSeconds має бути числом від 1 до 300 включно',
		});
	}

	logger.info(`Блокую event loop на ${durationSeconds} с.`);

	const startTime = Date.now() / 1000;
	while (true) {
		if (Date.now() / 1000 - startTime > durationSeconds) break;
	}

	res.json({ message: 'Кінець блокування Event Loop' });
});

const startGraphQLServer = async () => {
	const server = new ApolloServer<ApolloServerContext>({
		typeDefs,
		resolvers,
		formatError(formattedError: GraphQLFormattedError) {
			logger.error(formattedError.message);

			if (process.env.NODE_ENV === 'production') {
				// don't include anything that might expose the server code
				return { message: formattedError.message };
			}

			// if it's dev environment, don't do anything
			return formattedError;
		},
	});

	await server.start();

	app.use(
		'/graphql',
		expressMiddleware(server, {
			context: async ({ req }) => ({ user: req.user }),
		})
	);

	app.use(notFoundHandler);

	app.use(errorHandler);
};

startGraphQLServer();

export default app;
