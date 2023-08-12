import { Router } from 'express';

import { handleLogout } from '../controllers/logout.js';
import refreshTokenValidation from './util/refreshTokenValidation.js';
import validateRequest from '../middlewares/validate-request.js';

const router = Router();

router.post('/logout', refreshTokenValidation, validateRequest, handleLogout);

export default router;
