import { PoolClient } from 'pg';

import dbPool from '../services/postgres.service.js';

export const signUpUser = (options: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string | null;
    withOAuth?: boolean;
    dbClient?: PoolClient;
}) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        withOAuth = false,
        dbClient,
    } = options;

    const client = dbClient || dbPool;

    return client.query(
        `
        INSERT INTO users (
            email,
            password,
            first_name,
            last_name,
            phone_number,
            is_activated
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
    `,
        [email, password, firstName, lastName, phoneNumber, withOAuth]
    );
};

export const isEmailAvailable = async (email: string) => {
    const { rows } = await dbPool.query(
        `
        SELECT EXISTS(
            SELECT 1 FROM users WHERE email = $1
        )`,
        [email]
    );

    return !rows[0].exists;
};
