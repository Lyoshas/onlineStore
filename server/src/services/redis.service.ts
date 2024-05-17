import Redis from 'ioredis';

const redis = new Redis({
    port: +process.env.REDIS_PORT!,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    commandTimeout: +process.env.REDIS_COMMAND_TIMEOUT!,
    tls: { rejectUnauthorized: false }
});

export default redis;
