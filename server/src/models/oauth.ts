import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

import dbPool from '../services/postgres.service.js';
import OAuthUserData from '../interfaces/OAuthUserData.js';

export const getAuthorizationServerIdByName = (
    name: string
): Promise<number | null> => {
    return dbPool
        .query('SELECT id FROM oauth_resource_names WHERE name = $1', [name])
        .then(({ rows }) => (rows.length === 0 ? null : rows[0].id));
};

export const addOAuthStateToDB = (state: string, resourceNameId: number) => {
    return dbPool.query(
        'INSERT INTO oauth_states (state, resource_name_id) VALUES ($1, $2)',
        [state, resourceNameId]
    );
};

export const isOAuthStateValid = (state: string): Promise<boolean> => {
    return dbPool
        .query('SELECT EXISTS(SELECT 1 FROM oauth_states WHERE state = $1)', [
            state,
        ])
        .then(({ rows }) => rows[0].exists);
};

export const deleteOAuthState = (state: string) => {
    return dbPool.query('DELETE FROM oauth_states WHERE state = $1', [state]);
};

export const getAuthorizationServerNameByState = (
    state: string
): Promise<string | null> => {
    return dbPool
        .query(
            `
                SELECT o_r_s.name
                FROM oauth_states AS o_s
                INNER JOIN oauth_resource_names AS o_r_s
                    ON o_s.resource_name_id = o_r_s.id
                WHERE state = $1;
            `,
            [state]
        )
        .then(({ rows }) => (rows.length === 0 ? null : rows[0].name));
};

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
        'https://oauth2.googleapis.com/token?' +
            new URLSearchParams({
                client_id,
                client_secret,
                code,
                grant_type,
                redirect_uri,
            }).toString(),
        { method: 'POST' }
    )
        .then((response) => {
            if (response.status !== 200) {
                return Promise.reject(
                    'Something went wrong when retrieving the id token'
                );
            }
            return response.json();
        })
        .then((jsonResponse) => jsonResponse.id_token);
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
        avatarURL: userData.picture as string,
    };
};

export const getFacebookAccessTokenByCode = (code: string): Promise<string> => {
    return fetch(
        'https://graph.facebook.com/v6.0/oauth/access_token?' +
            new URLSearchParams({
                redirect_uri: process.env.OAUTH_REDIRECT_URI as string,
                client_id: process.env.FACEBOOK_CLIENT_ID as string,
                client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
                code,
            }).toString()
    )
        .then((response) => {
            if (response.status !== 200) {
                return Promise.reject(
                    'Something went wrong ' +
                        'while retrieving the access token from Facebook'
                );
            }
            return response.json();
        })
        .then((jsonResponse) => jsonResponse.access_token);
};

export const getUserDataFromFacebookAccessToken = (
    accessToken: string
): Promise<OAuthUserData> => {
    return fetch(
        'https://graph.facebook.com/me?fields=first_name,last_name,email,picture',
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )
        .then((response) => response.json())
        .then((userData) => ({
            firstName: userData.first_name as string,
            lastName: userData.last_name as string,
            email: userData.email as string,
            avatarURL: userData.picture.data.url as string,
        }));
};
