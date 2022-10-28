import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { graphqlHTTP } from 'express-graphql';

dotenv.config({ path: path.join(process.cwd(), 'src', 'config', '.env') });

import authRoutes from './routes/auth';
import identifyUser from './middlewares/identify-user';
import schema from './schema/schema';

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(process.cwd(), 'src', 'public')));

app.use(identifyUser);

app.use('/auth', authRoutes);

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(3000);
