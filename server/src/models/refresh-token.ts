import { CookieOptions, Response } from 'express';

import dbPool from '../services/postgres.service.js';
import { generateRandomString } from '../util/generateRandomString.js';

// there is a table in the database called 'token_types' that stores available token names
// as of the time of writing this comment, there are "activation" and "refresh" types of tokens.
// this line below tries to get the id of the "refreshToken" entry.
// this is needed to store the newly generated refresh token in the database
export const getRefreshTokenTypeId = async (): Promise<number> => {
    const { rows } = await dbPool.query<{ id: number }>(
        "SELECT id FROM token_types WHERE type = 'refresh'"
    );
    return rows[0].id;
};

// refresh token is generated as a random string and is then placed in the database
export const generateRefreshToken = async (
    userId: number
): Promise<{ refreshToken: string; expiresAt: Date }> => {
    // the length of the refresh token is 64 characters
    // why is "32" specified as an argument in the generateRandomString() function?
    // this function uses crypto.randomBytes under the hood, so this is a side effect of using this function.
    // Long story short, if you want to get a random string of length N, use "await generateRandomString(N / 2)"
    const refreshToken = await generateRandomString(32);
    const refreshTokenTypeId = await getRefreshTokenTypeId();

    const expiresAt = new Date(
        Date.now() +
            +(process.env.REFRESH_TOKEN_EXPIRATION_IN_SECONDS as string) * 1000
    );

    await dbPool.query(
        `
        INSERT INTO tokens (token, token_type_id, user_id, expires_at)
        VALUES ($1, $2, $3, $4)
    `,
        [refreshToken, refreshTokenTypeId, userId, expiresAt]
    );

    return { refreshToken, expiresAt };
};

const cookieStaticOptions: CookieOptions = {
    path: '/api/auth',
    httpOnly: true,
    sameSite: 'strict',
};

// this function will be used in multiple places
// to not copy paste this stuff, it's better to make a separate function for this
export const attachRefreshTokenAsCookie = (
    res: Response,
    refreshToken: string,
    expiresAt: Date
) => {
    // add the 'secure' option once you have an SSL certificate
    res.cookie('refreshToken', refreshToken, {
        expires: expiresAt,
        ...cookieStaticOptions,
    });
};

export const detachRefreshTokenAsCookie = (res: Response) => {
    res.clearCookie('refreshToken', cookieStaticOptions);
};

// if the refreshToken is expired or it doesn't exist, it will return null
export const getUserIdByRefreshToken = async (
    refreshToken: string
): Promise<number | null> => {
    const userId = await dbPool
        .query<{ user_id?: number }>(
            `
                SELECT tokens.user_id
                FROM tokens
                INNER JOIN token_types ON tokens.token_type_id = token_types.id
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
};

export const deleteRefreshTokenFromDB = (refreshToken: string) => {
    return dbPool.query(
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
};
