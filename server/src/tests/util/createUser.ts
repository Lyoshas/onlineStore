import { generateAccessToken } from '../../models/access-token';
import dbPool from '../../services/postgres.service';
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
            is_admin
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [
        `${randomString(15)}@test.com`,
        'test_password',
        randomString(15),
        randomString(15),
        isActivated,
        isAdmin
    ]).then(({ rows }) => rows[0].id);
};

export const createUserAndReturnAccessToken = async (
    options: CreateUserOptions
): Promise<string> => {
    const id: number = await createUserAndReturnId(options);
    return generateAccessToken(id);
};
