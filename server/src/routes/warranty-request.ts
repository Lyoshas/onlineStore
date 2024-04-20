import { Router } from 'express';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import { getWarrantyRequests } from '../controllers/warranty-request.js';

const router = Router();

router.get('/warranty-requests', ensureAuthentication, getWarrantyRequests);

export default router;
