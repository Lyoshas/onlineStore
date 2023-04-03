import redis from '../util/redis';

// for activation tokens and reset tokens
export const addTokenToRedis = async (options: {
    tokenType: 'activationToken' | 'resetToken';
    token: string;
    userId: number;
    expirationTimeInSeconds: number;
}) => {
    const { tokenType, token, userId, expirationTimeInSeconds } = options;
    await redis.hset(token, { type: tokenType, userId });
    await redis.expire(token, expirationTimeInSeconds);
};
