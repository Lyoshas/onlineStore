import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { Pool, PoolClient } from 'pg';

import dbPool from '../services/postgres.service.js';
import OAuthUserData from '../interfaces/OAuthUserData.js';

class OAuthModel {
    private dbClient: PoolClient | Pool;

    constructor(dbClient?: PoolClient) {
        this.dbClient = dbClient || dbPool;
    }

    public getAuthorizationServerIdByName(
        name: string
    ): Promise<number | null> {
        return this.dbClient
            .query('SELECT id FROM oauth_resource_names WHERE name = $1', [
                name,
            ])
            .then(({ rows }) => (rows.length === 0 ? null : rows[0].id));
    }

    public addOAuthStateToDB(state: string, resourceNameId: number) {
        return this.dbClient.query(
            'INSERT INTO oauth_states (state, resource_name_id) VALUES ($1, $2)',
            [state, resourceNameId]
        );
    }

    public isOAuthStateValid(state: string): Promise<boolean> {
        return this.dbClient
            .query(
                'SELECT EXISTS(SELECT 1 FROM oauth_states WHERE state = $1)',
                [state]
            )
            .then(({ rows }) => rows[0].exists);
    }

    public deleteOAuthState(state: string) {
        return this.dbClient.query(
            'DELETE FROM oauth_states WHERE state = $1',
            [state]
        );
    }

    public getAuthorizationServerNameByState(
        state: string
    ): Promise<string | null> {
        return this.dbClient
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
    }

    public getURLToGoogleAuthorizationServer(state: string) {
        return `
            https://accounts.google.com/o/oauth2/v2/auth
                ?client_id=${process.env.GOOGLE_CLIENT_ID}
                &redirect_uri=${process.env.OAUTH_REDIRECT_URI}
                &scope=email%20profile
                &response_type=code
                &state=${state}
        `.replace(/\s/g, '');
    }

    public getURLToFacebookAuthorizationServer(state: string) {
        return `
            https://www.facebook.com/dialog/oauth
                ?client_id=${process.env.FACEBOOK_CLIENT_ID}
                &redirect_uri=${process.env.OAUTH_REDIRECT_URI}
                &state=${state}
                &scope=public_profile,email
        `.replace(/\s/g, '');
    }

    public getGoogleIdToken(
        client_id: string,
        client_secret: string,
        code: string,
        grant_type: string,
        redirect_uri: string
    ): Promise<string> {
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
    }

    public getUserDataFromGoogleIdToken(idToken: string): OAuthUserData {
        const userData = jwt.decode(idToken) as any;
        if (!userData) throw new Error('userData should be an object');
        return {
            firstName: userData.given_name as string,
            lastName: userData.family_name as string,
            email: userData.email as string,
            avatarURL: userData.picture as string,
        };
    }

    public getFacebookAccessTokenByCode(code: string): Promise<string> {
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
    }

    public getUserDataFromFacebookAccessToken(
        accessToken: string
    ): Promise<OAuthUserData> {
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
    }
}

export default OAuthModel;
