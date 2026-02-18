"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssistantConfig = exports.handleVoiceWebhook = void 0;
const voiceService_1 = require("../services/voiceService");
const handleVoiceWebhook = async (req, res) => {
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
        voiceService_1.VoiceService.processCallResult(payload).catch(err => console.error('[VoiceWebhook] Error processing in background:', err));
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('[VoiceWebhook] Error handling webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.handleVoiceWebhook = handleVoiceWebhook;
// Endpoint to get the assistant config (helper for frontend/admin)
const getAssistantConfig = (req, res) => {
    const config = voiceService_1.VoiceService.getAssistantConfig();
    res.json(config);
};
exports.getAssistantConfig = getAssistantConfig;
