import Redis from 'ioredis';

const redis = new Redis({
    port: +process.env.REDIS_PORT!,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
});

export default redis;
