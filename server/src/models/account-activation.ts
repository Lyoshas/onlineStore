import redis from '../services/redis.service.js';
import dbPool from '../services/postgres.service.js';

export const getUserIdByActivationToken = async (
    token: string
): Promise<string | null> => {
    const tokenType = await redis.hget(token, 'type');
    if (tokenType !== 'activationToken') return null;
    return redis.hget(token, 'userId');
};

export const activateAccount = (userId: number) => {
    return dbPool.query('UPDATE users SET is_activated = true WHERE id = $1', [
        userId,
    ]);
};

export const isAccountActivated = (userId: number): Promise<boolean> => {
    return dbPool
        .query('SELECT is_activated FROM users WHERE id = $1', [userId])
        .then(({ rows }) => {
            if (rows.length === 0) throw new Error('Account does not exist');
            return rows[0].is_activated;
        });
};

export const generateAccountActivationLink = (activationToken: string) => {
    return `${process.env.REACT_APP_URL}/auth/activate-account/${activationToken}`;
};
