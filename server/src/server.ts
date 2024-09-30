import app from './app.js';
import osearchClient from './services/opensearch.service.js';
import redisClient from './services/redis.service.js';
import dbPool from './services/postgres.service.js';

const server = app.listen(3000, () => console.log('listening on port 3000'));

const cleanup = () => {
	server.close(async (err) => {
        if (err) console.error(err);
		await osearchClient.close();
		await dbPool.end();
		await redisClient.quit();
	});
};

// termination signal that is usually invoked by other processes
process.on('SIGTERM', () => cleanup);
// termination signal that is usually invoked by the user
process.on('SIGINT', () => cleanup);
