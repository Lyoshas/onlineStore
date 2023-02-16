import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import axios from 'axios';
import { PoolClient } from 'pg';

import dbPool from '../util/database';
import TokenEntry from '../interfaces/TokenEntry';
import UserCredentials from '../interfaces/UserCredentials';
import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';
import OAuthUserData from '../interfaces/OAuthUserData';
import UserPrivileges from '../interfaces/UserPrivileges';
import RecaptchaValidationResult from '../interfaces/RecaptchaValidationResult';

export const signUpUser = (
    options: {
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        phoneNumber: string | null,
        avatarURL?: string,
        withOAuth?: boolean,
        dbClient?: PoolClient
    }
) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        avatarURL = (process.env.DEFAULT_AVATAR_URL as string),
        withOAuth = false,
        dbClient
    } = options;

    const client = dbClient || dbPool;

    return client.query(`
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

export const addActivationTokenToDB = async (
    userId: number,
    activationToken: string,
    dbClient?: PoolClient
) => {
    const client = dbClient || dbPool;

    const activationTypeId: number =
        await client
            .query("SELECT id FROM token_types WHERE type = 'activation'")
            .then(({ rows }) => rows[0].id);
    
    return client.query(`
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

export const isAccountActivated = (userId: number): Promise<boolean> => {
    return dbPool.query(
        'SELECT is_activated FROM users WHERE id = $1',
        [userId]
    ).then(({ rows }) => {
        if (rows.length === 0) throw new Error('Account does not exist');
        return rows[0].is_activated;
    });
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

// it returns an object with { isVerified: boolean; isAdmin: boolean }
// or, if the user doesn't exist, it returns null
export const getUserPrivileges = async (
    userId: number
): Promise<UserPrivileges | null> => {
    const { rows } = await dbPool.query(`
        SELECT is_admin FROM users WHERE id = $1
    `, [userId]);

    if (rows[0]) {
        return {
            isAdmin: rows[0].is_admin
        }
    }

    return null;
};

export const generateAPIKey = (userId: number): Promise<string | never> => {
    return new Promise((resolve, reject) => {
        getUserPrivileges(userId)
            .then(userPrivileges => {
                if (userPrivileges === null) {
                    reject(`user with userId ${userId} does not exist`);
                }

                jwt.sign(
                    { id: userId, ...userPrivileges },
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
            })
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

export const getAuthorizationServerIdByName = (
    name: string
): Promise<number | null> => {
    return dbPool.query(
        'SELECT id FROM oauth_resource_names WHERE name = $1',
        [name]
    )
        .then(({ rows }) => rows.length === 0 ? null : rows[0].id);
};

export const addOAuthStateToDB = (state: string, resourceNameId: number) => {
    return dbPool.query(
        'INSERT INTO oauth_states (state, resource_name_id) VALUES ($1, $2)',
        [state, resourceNameId]
    );
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

export const getAuthorizationServerNameByState = (
    state: string
): Promise<string | null> => {
    return dbPool.query(`
        SELECT o_r_s.name
        FROM oauth_states AS o_s
        INNER JOIN oauth_resource_names AS o_r_s
            ON o_s.resource_name_id = o_r_s.id
        WHERE state = $1;
    `, [state])
        .then(({ rows }) => rows.length === 0 ? null : rows[0].name)
}

export const getURLToGoogleAuthorizationServer = (state: string) => {
    return `
        https://accounts.google.com/o/oauth2/v2/auth
            ?client_id=${process.env.GOOGLE_CLIENT_ID}
            &redirect_uri=${process.env.OAUTH_REDIRECT_URI}
            &scope=email%20profile
            &response_type=code
            &state=${state}
    `.replace(/\s/g, '');
};

export const getURLToFacebookAuthorizationServer = (state: string) => {
    return `
        https://www.facebook.com/dialog/oauth
            ?client_id=${process.env.FACEBOOK_CLIENT_ID}
            &redirect_uri=${process.env.OAUTH_REDIRECT_URI}
            &state=${state}
            &scope=public_profile,email
    `.replace(/\s/g, '');
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

export const getUserDataFromGoogleIdToken = (
    idToken: string
): OAuthUserData => {
    const userData = jwt.decode(idToken) as any;
    if (!userData) throw new Error('userData should be an object');
    return {
        firstName: userData.given_name as string,
        lastName: userData.family_name as string,
        email: userData.email as string,
        avatarURL: userData.picture as string
    };
};

export const getFacebookAccessTokenByCode = (code: string): Promise<string> => {
    return fetch(
        'https://graph.facebook.com/v6.0/oauth/access_token?'
        + new URLSearchParams({
            redirect_uri: process.env.OAUTH_REDIRECT_URI as string,
            client_id: process.env.FACEBOOK_CLIENT_ID as string,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
            code
        }).toString()
    )
        .then(response => {
            if (response.status !== 200) {
                return Promise.reject(
                    'Something went wrong ' +
                    'while retrieving the access token from Facebook'
                );
            }
            return response.json()
        })
        .then(jsonResponse => jsonResponse.access_token);
};

export const getUserDataFromFacebookAccessToken = (
    accessToken: string
): Promise<OAuthUserData> => {
    return fetch(
        'https://graph.facebook.com/me?fields=first_name,last_name,email,picture',
        {
            headers: {
                Authorization: `Bearer ${accessToken}` 
            }
        }
    )
        .then(response => response.json())
        .then(userData => ({
            firstName: userData.first_name as string,
            lastName: userData.last_name as string,
            email: userData.email as string,
            avatarURL: userData.picture.data.url as string
        }));
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

export const isEmailAvailable = async (email: string) => {
    const { rows } = await dbPool.query(`
        SELECT EXISTS(
            SELECT 1 FROM users WHERE email = $1
        )
    `, [email]);
    
    return !rows[0].exists;
};

export const isRecaptchaValid = async (
    recaptchaToken: string,
    remoteIP?: string
): Promise<RecaptchaValidationResult> => {
    const { data } = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify?' + 
        new URLSearchParams({
            secret: process.env.RECAPTCHA_SECRET_KEY as string,
            response: recaptchaToken,
            // user's IP address
            remoteip: remoteIP || ''
        }).toString()
    );

    // more about possible errors: https://developers.google.com/recaptcha/docs/verify
    return { success: data.success, errors: data['error-codes'] };
};
