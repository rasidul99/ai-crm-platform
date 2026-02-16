import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';

// Verify Webhook (Meta requirement)
export const verifyWebhook = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            console.log('[Webhook] Verified webhook');
            res.status(200).send(challenge);
        } else {
            console.error('[Webhook] Verification failed');
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

// Handle Webhook Event
export const handleWebhookEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body;

        // Check if this is an event from a page subscription
        if (body.object === 'page') {
            // Iterate over each entry - there may be multiple if batched
            for (const entry of body.entry) {
                // Get the webhook event. entry.messaging is an array, but 
                // will only contain one event per call
                const webhook_event = entry.messaging[0];
                console.log('[Webhook] Received event:', webhook_event);

                // Get the sender PSID
                const sender_psid = webhook_event.sender.id;

                if (webhook_event.message && webhook_event.message.text) {
                    await ChatService.handleIncomingMessage('FACEBOOK', sender_psid, webhook_event.message.text);
                }
            }

            // Return a '200 OK' response to all events
            res.status(200).send('EVENT_RECEIVED');
        } else {
            // Return a '404 Not Found' if event is not from a page subscription
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('[Webhook] Error handling event:', error);
        res.sendStatus(500);
    }
};
