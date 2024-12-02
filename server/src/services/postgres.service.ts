import pg from 'pg';

export default new pg.Pool({
	ssl:
		process.env.NODE_ENV === 'production'
			? { rejectUnauthorized: false }
			: false,
});
