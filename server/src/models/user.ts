import bcryptjs from 'bcryptjs';
import { Pool, PoolClient } from 'pg';

import dbPool from '../services/postgres.service.js';
import UserCredentials from '../interfaces/UserCredentials.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

class UserModel {
    private dbClient: PoolClient | Pool;

    constructor(dbClient?: PoolClient) {
        this.dbClient = dbClient || dbPool;
    }

    public getUserIdByEmail(email: string): Promise<number | null> {
        return this.dbClient
            .query('SELECT id FROM users WHERE email = $1', [email])
            .then(({ rows }) => (rows.length === 0 ? null : rows[0].id));
    }

    public getPhoneNumberByUserId(userId: number): Promise<string | null> {
        return this.dbClient
            .query('SELECT phone_number FROM users WHERE id = $1', [userId])
            .then(({ rows }) =>
                rows.length === 0 ? null : rows[0].phone_number
            );
    }

    public getEmailByUserId(userId: number): Promise<string | null> {
        return this.dbClient
            .query('SELECT email FROM users WHERE id = $1', [userId])
            .then(({ rows }) => (rows.length === 0 ? null : rows[0].email));
    }

    public getUserIdByCredentials(
        login: string,
        password: string
    ): Promise<number | null> {
        return this.dbClient
            .query(
                `
                    SELECT
                        id,
                        email,
                        password
                    FROM users
                    WHERE email = $1
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
    }

    public async getProfileByUserId(userId: number): Promise<{
        firstName: string;
        lastName: string;
    }> {
        const {
            rows: [{ first_name: firstName, last_name: lastName }],
        } = await this.dbClient.query<{
            first_name: string;
            last_name: string;
        }>(
            formatSqlQuery(`
                SELECT
                    first_name,
                    last_name
                FROM users
                WHERE id = $1
            `),
            [userId]
        );

        return { firstName, lastName };
    }
}

export default UserModel;
