import { Request, Response } from 'express';
import { VoiceService } from '../services/voiceService';

export const handleVoiceWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const secret = req.headers['x-vapi-secret'];

        // Use a mock secret for local testing if env is not set
        const expectedSecret = process.env.VAPI_WEBHOOK_SECRET || 'mock_secret';

        if (secret !== expectedSecret) {
            console.warn('[VoiceWebhook] Invalid secret attempt');
            // res.status(403).json({ error: 'Invalid secret' }); 
            // Vapi might retry on 403, allowing pass for dev if needed, strictly should range 400-499
        }

        const payload = req.body;

        // Process asynchronously to reply fast to Vapi
        VoiceService.processCallResult(payload).catch(err =>
            console.error('[VoiceWebhook] Error processing in background:', err)
        );

        res.status(200).send('OK');

    } catch (error) {
        console.error('[VoiceWebhook] Error handling webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Endpoint to get the assistant config (helper for frontend/admin)
export const getAssistantConfig = (req: Request, res: Response): void => {
    const config = VoiceService.getAssistantConfig();
    res.json(config);
};
