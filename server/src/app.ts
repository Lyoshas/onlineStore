import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { GraphQLFormattedError } from 'graphql';
import cookieParser from 'cookie-parser';

const NODE_ENV = process.env.NODE_ENV as string;

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
import setupCors from './middlewares/setup-cors.js';

const app = express();

app.use(setupCors);

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

const startGraphQLServer = async () => {
    const server = new ApolloServer<ApolloServerContext>({
        typeDefs,
        resolvers,
        formatError(formattedError: GraphQLFormattedError) {
            if (process.env.NODE_ENV === 'production') {
                return { message: formattedError.message };
            }

            return formattedError;
        },
        plugins:
            process.env.NODE_ENV === 'development'
                ? []
                : [ApolloServerPluginLandingPageDisabled()],
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
