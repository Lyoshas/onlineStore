import { RequestHandler } from 'express';

import AuthenticationError from '../errors/AuthenticationError';

const ensureAuthentication: RequestHandler = (req, res, next) => {
    let errorMessage: string;

    if (res.locals.hasAccessTokenExpired) {
        console.log('ensure authentication: the access token has expired');
        errorMessage = 'The access token has expired';
    } else if (res.locals.isAccessTokenInvalid) {
        console.log(
            'ensure authentication: the access token is either invalid or is not specified'
        );
        errorMessage = 'The access token is either invalid or is not provided';
    }

    // if the errorMessage is specified
    if (errorMessage!) {
        throw new AuthenticationError(errorMessage);
    }

    next();
};

export default ensureAuthentication;
