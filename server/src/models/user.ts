import bcryptjs from 'bcryptjs';

import dbPool from '../util/database';
import UserCredentials from '../interfaces/UserCredentials';

export const getUserIdByEmail = (email: string): Promise<number | null> => {
    return dbPool
        .query('SELECT id FROM users WHERE email = $1', [email])
        .then(({ rows }) => (rows.length === 0 ? null : rows[0].id));
};

export const getPhoneNumberByUserId = (
    userId: number
): Promise<string | null> => {
    return dbPool
        .query('SELECT phone_number FROM users WHERE id = $1', [userId])
        .then(({ rows }) => (rows.length === 0 ? null : rows[0].phone_number));
};

export const getEmailByUserId = (userId: number): Promise<string | null> => {
    return dbPool
        .query('SELECT email FROM users WHERE id = $1', [userId])
        .then(({ rows }) => (rows.length === 0 ? null : rows[0].email));
};

export const getUserIdByCredentials = (
    login: string,
    password: string
): Promise<number | null> => {
    return dbPool
        .query(
            `
                SELECT
                    id,
                    email,
                    phone_number,
                    password
                FROM users
                WHERE phone_number = $1 OR email = $1
            `,
            [login]
        )
        .then(async (result) => {
            const userData: UserCredentials | null =
                result.rows.length === 0 ? null : result.rows[0];

            if (
                !userData ||
                !(await bcryptjs.compare(password, userData.password))
            ) {
                return Promise.resolve(null);
            }

            return Promise.resolve(userData.id);
        });
};
