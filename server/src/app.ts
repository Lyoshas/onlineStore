import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { graphqlHTTP } from 'express-graphql';

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
import schema from './schema/schema';

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(process.cwd(), 'src', 'public')));

app.use(identifyUser);

app.use('/auth', authRoutes);

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.use('/user', cartRoutes);

app.use('/user', orderRoutes);

export default app;
