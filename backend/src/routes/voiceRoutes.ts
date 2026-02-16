import { Router } from 'express';
import { handleVoiceWebhook, getAssistantConfig } from '../controllers/voiceController';

const router = Router();

router.post('/webhook', handleVoiceWebhook);
router.get('/config', getAssistantConfig);

export default router;
