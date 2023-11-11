import knexConfig from 'knex';

// we won't establish the connection to the DB, because we only need 'knex' to construct dynamic SQL queries
// if we don't know the amount of parameters that the user provided in advance, it wouldn't be practical to use the native 'pg' driver
const knex = knexConfig({ client: 'pg', useNullAsDefault: false });

export default knex;
