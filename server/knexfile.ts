import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// const NODE_ENV = process.env.NODE_ENV;

// if (!NODE_ENV || !['dev', 'prod'].includes(NODE_ENV)) {
//     throw new Error(`
//         Environment variable NODE_ENV is neither 'dev' nor 'prod'
//     `.replace(/[\n\t]|\s{2}/g, ''));
// }

// dotenv.config({
//     path: path.join(
//         process.cwd(),
//         'src',
//         'config',
//         NODE_ENV === 'dev' ? 'dev.env' : 'prod.env'
//     ),
// });

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'postgresql',
        connection: {
            host: process.env.PGHOST_FOR_MIGRATIONS,
            port: +process.env.PGPORT!,
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
            host: process.env.PGHOST_FOR_MIGRATIONS,
            port: +process.env.PGPORT!,
            database: process.env.PGDATABASE,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
        },
        pool: {
            min: 2,
            max: 30,
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
