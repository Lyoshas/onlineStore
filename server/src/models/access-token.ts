import jwt from 'jsonwebtoken';

import { getUserPrivileges } from './authorization';
import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';

// The access token is generated as a JWT.
// It's important to make sure that the user exists beforehand,
// otherwise the token will point to a non-existent user
export const generateAccessToken = (
    userId: number
): Promise<string | never> => {
    return new Promise((resolve, reject) => {
        getUserPrivileges(userId).then((userPrivileges) => {
            if (userPrivileges === null) {
                reject(`user with userId ${userId} does not exist`);
            }

            jwt.sign(
                { id: userId, ...userPrivileges },
                process.env.ACCESS_TOKEN_SECRET as string,
                {
                    algorithm: 'HS256',
                    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
                },
                (err, encoded) => {
                    if (err) reject(err);
                    resolve(encoded as string);
                }
            );
        });
    });
};

export const verifyAccessToken = (
    accessToken: string
): Promise<VerifiedUserInfo> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET as string,
            (err, decoded) => {
                if (err) reject(err);
                resolve(decoded as VerifiedUserInfo);
            }
        );
    });
};
