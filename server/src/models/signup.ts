import { PoolClient } from 'pg';

import dbPool from '../services/postgres.service.js';

export const signUpUser = (options: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string | null;
    avatarURL?: string;
    withOAuth?: boolean;
    dbClient?: PoolClient;
}) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        avatarURL = process.env.DEFAULT_AVATAR_URL as string,
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
            is_activated,
            avatar_URL
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `,
        [
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            withOAuth,
            avatarURL,
        ]
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
