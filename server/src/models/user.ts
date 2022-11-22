import sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';

import dbPool from '../util/database';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendEmail = (
    recipient: string,
    subject: string,
    htmlMessage: string
) => {
    return sgMail.send({
        to: recipient,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject,
        html: htmlMessage
    });
};

export const generateToken = (sizeInBytes: number = 64): Promise<string | Error> => {
    return new Promise((resolve, reject) => {
        randomBytes(sizeInBytes, (err, buf) => {
            if (err) return reject(err);
            resolve(buf.toString('hex'));
        })
    });
};

export const getUserIdByEmail = (email: string): Promise<number | null> => {
    return dbPool.query('SELECT id FROM users WHERE email = $1', [email])
        .then(({ rows }) => rows.length === 0 ? null : rows[0].id);
};

export const getPhoneNumberByUserId = (
    userId: number
): Promise<string | null> => {
    return dbPool.query(
        'SELECT phone_number FROM users WHERE id = $1',
        [userId]
    ).then(({ rows }) => rows.length === 0 ? null : rows[0].phone_number);
};
