import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'src', 'config', 'dev.env') });

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'postgresql',
        connection: {
            host: 'localhost',
            database: process.env.PGDATABASE,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: path.join(process.cwd(), 'db-migrations'),
        },
        seeds: {
            directory: path.join(process.cwd(), 'db-seeds'),
        },
    },
    production: {
        client: 'postgresql',
        connection: {
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: path.join(process.cwd(), 'db-migrations'),
        },
        seeds: {
            directory: path.join(process.cwd(), 'db-seeds'),
        },
    },
};

export default config;
