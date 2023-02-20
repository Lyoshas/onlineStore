import { generateAccessToken } from '../../models/auth';
import dbPool from '../../util/database';
import CreateUserOptions from '../interfaces/CreateUserOptions';
import { randomString } from './random';

export function createUserAndReturnId(
    options: CreateUserOptions
): Promise<number> {
    const { isAdmin, isActivated } = options;
    return dbPool.query(`
        INSERT INTO users (
            email,
            password,
            first_name,
            last_name,
            is_activated,
            avatar_url,
            is_admin
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `, [
        `${randomString(15)}@test.com`,
        'test_password',
        randomString(15),
        randomString(15),
        isActivated,
        '/images/default-avatar.png',
        isAdmin
    ]).then(({ rows }) => rows[0].id);
};

export const createUserAndReturnAccessToken = async (
    options: CreateUserOptions
): Promise<string> => {
    const id: number = await createUserAndReturnId(options);
    return generateAccessToken(id);
};
