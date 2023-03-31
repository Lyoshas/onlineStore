import { Router } from 'express';
import { query } from 'express-validator';

import * as oauthController from '../controllers/oauth';
import validateRequest from '../middlewares/validate-request';

const router = Router();

// get a link to the google/facebook authorization server
router.get(
    '/oauth-link/:authorizationServerName',
    oauthController.getURLToOAuthAuthorizationServer
);

// if the user consented, they will be redirected to the React page,
// and from that page the client will make a request to this endpoint
router.post(
    '/oauth-callback',
    query('state').isString().withMessage('the field "state" must be a string'),
    query('code').isString().withMessage('the field "code" must be a string'),
    validateRequest,
    oauthController.OAuthCallback
);

export default router;
