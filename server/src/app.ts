import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { GraphQLFormattedError } from 'graphql';

const NODE_ENV = process.env.NODE_ENV as string;

if (!['development', 'test', 'production'].includes(NODE_ENV)) {
    throw new Error(`
        Environment variable NODE_ENV is neither
             'development', nor 'test', nor 'production'
    `.replace(/[\n\t]|\s{2}/g, ''));
}

dotenv.config({
    path: path.join(
        process.cwd(),
        'src',
        'config',
        ['development', 'test'].includes(NODE_ENV) ? 'dev.env' : 'prod.env'
    )
});

import authRoutes from './routes/auth';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/order';
import identifyUser from './middlewares/identify-user';
import { typeDefs, resolvers } from './graphql/schema';
import ApolloServerContext from './interfaces/ApolloServerContext';
import errorHandler from './middlewares/error-handler';

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(process.cwd(), 'src', 'public')));

app.use(identifyUser);

app.use('/auth', authRoutes);

const startGraphQLServer = async () => {
    const server = new ApolloServer<ApolloServerContext>({
        typeDefs,
        resolvers,
        formatError(formattedError: GraphQLFormattedError) {
            if (process.env.NODE_ENV === 'production') {
                // don't include anything that might expose the server code
                return { message: formattedError.message };
            }

            // if it's dev environment, don't do anything
            return formattedError;
        },
    });

    await server.start();

    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req }) => ({ user: req.user })
    }));
};

startGraphQLServer();

app.use('/user', cartRoutes);

app.use('/user', orderRoutes);

app.use(errorHandler);

export default app;
