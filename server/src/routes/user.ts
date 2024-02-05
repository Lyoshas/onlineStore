import express from 'express';

import ensureAuthentication from '../middlewares/ensure-authentication.js';
import * as userController from '../controllers/user.js';

const router = express.Router();

router.get('/profile', ensureAuthentication, userController.getProfile);

export default router;
