import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { graphqlHTTP } from 'express-graphql';

dotenv.config({
    path: path.join(
        process.cwd(),
        'src',
        'config',
        ['dev', 'test'].includes(process.env.NODE_ENV as string) ?
            'dev.env' :
            'prod.env'
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
