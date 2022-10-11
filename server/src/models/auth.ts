import dbPool from '../util/database';

export const signUpUser = (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string
) => {
    return dbPool.query(`
        INSERT INTO users (email, password, first_name, last_name, phone_number)
        VALUES ($1, $2, $3, $4, $5);
    `, [email, password, firstName, lastName, phoneNumber]);
};
