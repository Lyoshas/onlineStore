import dbPool from '../util/database';

import TokenEntry from '../interfaces/TokenEntry';

export const signUpUser = (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string
) => {
    return dbPool.query(`
        INSERT INTO users (email, password, first_name, last_name, phone_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `, [email, password, firstName, lastName, phoneNumber]);
};

export const addActivationTokenToDB = async (userId: number, activationToken: string) => {
    const activationTypeId: number =
        await dbPool
            .query("SELECT id FROM token_types WHERE type = 'activation'")
            .then(({ rows }) => rows[0].id);
    
    return dbPool.query(`
        INSERT INTO tokens (token, token_type_id, user_id, expires_at)
        VALUES ($1, $2, $3, $4)
    `, [
        activationToken,
        activationTypeId,
        userId,
        new Date(
            Date.now() + parseInt(
                process.env.ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS as string
            ) * 1000
        )
    ]);
};

export const getActivationTokenEntry = (
    activationToken: string
): Promise<TokenEntry | null> => {
    return dbPool
        .query('SELECT * FROM tokens WHERE token = $1', [activationToken])
        .then(result => result.rows[0]);
};

export const activateAccount = (userId: number) => {
    return dbPool.query(
        'UPDATE users SET is_activated = true WHERE id = $1',
        [userId]
    );
};
