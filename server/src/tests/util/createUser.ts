import { generateAPIKey } from '../../models/auth';
import dbPool from '../../util/database';
import CreateUserOptions from '../interfaces/CreateUserOptions';

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
        'test@test.com',
        'test_password',
        'firstName',
        'lastName',
        isActivated,
        '/images/default-avatar.png',
        isAdmin
    ]).then(({ rows }) => rows[0].id);
};

export const createUserAndReturnAPIKey = async (
    options: CreateUserOptions
): Promise<string> => {
    const id: number = await createUserAndReturnId(options);
    return generateAPIKey(id);
};
