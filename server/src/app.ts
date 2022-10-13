import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'src', 'config', '.env') });

import authRoutes from './routes/auth';

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.listen(3000);
