import sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';

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
