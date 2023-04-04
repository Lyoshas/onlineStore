import { Router } from 'express';

import { handleLogout } from '../controllers/logout';
import refreshTokenValidation from './util/refreshTokenValidation';
import validateRequest from '../middlewares/validate-request';

const router = Router();

router.post('/logout', refreshTokenValidation, validateRequest, handleLogout);

export default router;
