import UserPrivileges from '../interfaces/UserPrivileges';
import dbPool from '../util/database';

// it returns an object with { isAdmin: boolean }
// or, if the user doesn't exist, it returns null
export const getUserPrivileges = async (
    userId: number
): Promise<UserPrivileges | null> => {
    const { rows } = await dbPool.query(
        `SELECT is_admin FROM users WHERE id = $1`,
        [userId]
    );

    if (rows[0]) return { isAdmin: rows[0].is_admin };

    return null;
};
