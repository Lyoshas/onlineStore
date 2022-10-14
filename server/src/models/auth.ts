import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import dbPool from '../util/database';
import TokenEntry from '../interfaces/TokenEntry';
import UserCredentials from '../interfaces/UserCredentials';
import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';

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

export const getUserIdByCredentials = (
    login: string,
    password: string
): Promise<number | null> => {
    return dbPool.query(`
        SELECT
            id,
            email,
            phone_number,
            password
        FROM users
        WHERE phone_number = $1 OR email = $1
    `, [login])
        .then(async result => {;
            const userData: UserCredentials | null =
                result.rows.length === 0
                ? null 
                : result.rows[0];

            if (!userData || !await bcryptjs.compare(password, userData.password)) {
                return Promise.resolve(null);
            }

            return Promise.resolve(userData.id);
        });
};

export const generateAPIKey = (userId: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { id: userId },
            process.env.API_KEY_SECRET as string,
            {
                algorithm: 'HS256',
                expiresIn: process.env.API_KEY_EXPIRES_IN
            },
            (err, encoded) => {
                if (err) reject(err);
                resolve(encoded as string);
            }
        )
    });
};

export const verifyAPIKey = (API_KEY: string): Promise<VerifiedUserInfo> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            API_KEY + 'g',
            process.env.API_KEY_SECRET as string,
            (err, decoded) => {
                if (err) reject(err);
                resolve(decoded as VerifiedUserInfo);
            }
        );
    });
};
