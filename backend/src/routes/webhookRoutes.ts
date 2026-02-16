import { Router } from 'express';
import { verifyWebhook, handleWebhookEvent } from '../controllers/webhookController';

const router = Router();

router.get('/', verifyWebhook);
router.post('/', handleWebhookEvent);

export default router;
