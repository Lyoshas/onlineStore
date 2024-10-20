import express from 'express';

import * as healthController from '../controllers/health.js';

const router = express.Router();

router.get('/health', healthController.checkHealth);

export default router;
