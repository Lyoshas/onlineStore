import sgMail from '@sendgrid/mail';

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
