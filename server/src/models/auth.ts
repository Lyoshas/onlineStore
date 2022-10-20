import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

import dbPool from '../util/database';
import TokenEntry from '../interfaces/TokenEntry';
import UserCredentials from '../interfaces/UserCredentials';
import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';

export const signUpUser = (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string | null,
    avatarURL: string = (process.env.DEFAULT_AVATAR_URL as string),
    withOAuth: boolean = false
) => {
    return dbPool.query(`
        INSERT INTO users (
            email,
            password,
            first_name,
            last_name,
            phone_number,
            is_activated,
            avatar_URL
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `, [email, password, firstName, lastName, phoneNumber, withOAuth, avatarURL]);
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
            API_KEY,
            process.env.API_KEY_SECRET as string,
            (err, decoded) => {
                if (err) reject(err);
                resolve(decoded as VerifiedUserInfo);
            }
        );
    });
};

export const addOAuthStateToDB = (state: string) => {
    return dbPool.query('INSERT INTO oauth_states (state) VALUES ($1)', [state]);
};

export const isOAuthStateValid = (state: string): Promise<boolean> => {
    return dbPool.query(
        'SELECT EXISTS(SELECT 1 FROM oauth_states WHERE state = $1)',
        [state]
    )
        .then(({ rows }) => rows[0].exists);
};

export const deleteOAuthState = (state: string) => {
    return dbPool.query('DELETE FROM oauth_states WHERE state = $1', [state]);
};

export const getGoogleIdToken = (
    client_id: string,
    client_secret: string,
    code: string,
    grant_type: string,
    redirect_uri: string
): Promise<string> => {
    return fetch(
        'https://oauth2.googleapis.com/token?' + new URLSearchParams({
            client_id,
            client_secret,
            code,
            grant_type,
            redirect_uri
        }).toString(),
        { method: 'POST' }
    )
        .then(response => {
            if (response.status !== 200) {
                return Promise.reject('Something went wrong when retrieving the id token');
            }
            return response.json();
        })
        .then(jsonResponse => jsonResponse.id_token);
};

export const getUserDataFromGoogleIdToken = (idToken: string) => {
    const userData = jwt.decode(idToken) as any;
    if (!userData) throw new Error('userData should be an object');
    return {
        firstName: userData.given_name as string,
        lastName: userData.family_name as string,
        email: userData.email as string,
        avatarURL: userData.picture as string
    };
};

// this function is necessary for OAuth purposes
// if the user signed up with their google account, it's necessary to generate a password
export const generateStrongPassword = () => {
    // get a random integer from min to max
    function randomInteger(min: number, max: number) {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }

    function getRandomElement(array: any[] | string) {
        return array[randomInteger(0, array.length - 1)];
    }

    function shuffle(array: any[]) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }

    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseLetters = lowercaseLetters.toUpperCase();
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()~_+}{":>?<,./\'";][\\`-=';

    let strongPassword = '';

    for (let i = 0; i < randomInteger(5, 10); i++) {
        strongPassword += 
            getRandomElement(lowercaseLetters) +
            getRandomElement(uppercaseLetters) +
            getRandomElement(numbers) +
            getRandomElement(symbols); 
    }

    strongPassword = shuffle(strongPassword.split('')).join('');
    return strongPassword;
};
