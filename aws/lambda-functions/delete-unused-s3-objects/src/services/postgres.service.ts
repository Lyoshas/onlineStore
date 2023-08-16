import { Pool } from 'pg';

// 'pg' will pick up all the necessary credentials by using environment variables
const dbPool = new Pool();

export default dbPool;
