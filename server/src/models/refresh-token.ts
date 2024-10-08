import { CookieOptions, Response } from 'express';
import { Pool, PoolClient } from 'pg';

import dbPool from '../services/postgres.service.js';
import { generateRandomString } from '../util/generateRandomString.js';

class RefreshTokenModel {
    private dbClient: PoolClient | Pool;
    private static cookieStaticOptions: CookieOptions = {
        path: '/api/auth',
        httpOnly: true,
        sameSite: 'strict',
    };

    constructor(dbClient?: PoolClient) {
        this.dbClient = dbClient || dbPool;
    }

    // there is a table in the database called 'token_types' that stores available token names
    // as of the time of writing this comment, there are "activation" and "refresh" types of tokens.
    // this line below tries to get the id of the "refreshToken" entry.
    // this is needed to store the newly generated refresh token in the database
    public async getRefreshTokenTypeId(): Promise<number> {
        const { rows } = await this.dbClient.query<{ id: number }>(
            "SELECT id FROM token_types WHERE type = 'refresh'"
        );
        return rows[0].id;
    }

    // refresh token is generated as a random string and is then placed in the database
    public async generateRefreshToken(
        userId: number
    ): Promise<{ refreshToken: string; expiresAt: Date }> {
        // the length of the refresh token is 64 characters
        // why is "32" specified as an argument in the generateRandomString() function?
        // this function uses crypto.randomBytes under the hood, so this is a side effect of using this function.
        // Long story short, if you want to get a random string of length N, use "await generateRandomString(N / 2)"
        const refreshToken = await generateRandomString(32);
        const refreshTokenTypeId = await this.getRefreshTokenTypeId();

        const expiresAt = new Date(
            Date.now() +
                +(process.env.REFRESH_TOKEN_EXPIRATION_IN_SECONDS as string) *
                    1000
        );

        await this.dbClient.query(
            `
                INSERT INTO tokens (token, token_type_id, user_id, expires_at)
                VALUES ($1, $2, $3, $4)
            `,
            [refreshToken, refreshTokenTypeId, userId, expiresAt]
        );

        return { refreshToken, expiresAt };
    }

    // this function will be used in multiple places
    // to not copy paste this stuff, it's better to make a separate function for this
    public static attachRefreshTokenAsCookie(
        res: Response,
        refreshToken: string,
        expiresAt: Date
    ) {
        // add the 'secure' option once you have an SSL certificate
        res.cookie('refreshToken', refreshToken, {
            expires: expiresAt,
            ...this.cookieStaticOptions,
        });
    }

    public static detachRefreshTokenAsCookie(res: Response) {
        res.clearCookie('refreshToken', this.cookieStaticOptions);
    }

    // if the refreshToken is expired or it doesn't exist, it will return null
    public async getUserIdByRefreshToken(
        refreshToken: string
    ): Promise<number | null> {
        const userId = await this.dbClient
            .query<{ user_id?: number }>(
                `
                    SELECT tokens.user_id
                    FROM tokens
                    INNER JOIN token_types
                        ON tokens.token_type_id = token_types.id
                    WHERE
                        token = $1
                        AND token_types.type = 'refresh'
                        AND expires_at > CURRENT_TIMESTAMP
                `,
                [refreshToken]
            )
            .then(({ rows }) => rows[0]?.user_id);

        if (!userId) return null;

        return userId;
    }

    public deleteRefreshTokenFromDB(refreshToken: string) {
        return this.dbClient.query(
            `
                DELETE FROM tokens
                USING token_types
                WHERE
                    tokens.token_type_id = token_types.id
                    AND token_types.type = 'refresh'
                    AND tokens.token = $1
            `,
            [refreshToken]
        );
    }
}

export default RefreshTokenModel;
