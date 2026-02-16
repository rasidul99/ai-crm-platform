import { PrismaClient } from '@prisma/client';
import { AIService } from './aiService';
import { CalendlyService } from './calendlyService';
import axios from 'axios';

const prisma = new PrismaClient();

export class ChatService {
    // Handle incoming message from any platform
    static async handleIncomingMessage(platform: string, socialId: string, text: string): Promise<string> {
        console.log(`[ChatService] Received message from ${socialId} on ${platform}: ${text}`);

        // 1. Find or Create Lead
        let lead = await prisma.lead.findUnique({
            where: { socialId }
        });

        if (!lead) {
            // Check if we can find by email/phone if provided in text (advanced logic skipped for now)
            // Create new lead
            lead = await prisma.lead.create({
                data: {
                    socialId,
                    platform,
                    status: 'NEW',
                    source: platform === 'FACEBOOK' ? 'FACEBOOK' : 'OTHER',
                    name: `User ${socialId}` // Placeholder name
                }
            });
        } else {
            // Update status to REPLIED
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: 'REPLIED' }
            });
        }

        // 2. Fetch Chat History (Last 5 messages)
        const history = await prisma.interaction.findMany({
            where: { leadId: lead.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        const historyText = history.reverse().map(h => h.content);

        // 3. Generate AI Response
        const aiResponse = await AIService.generateChatResponse(historyText, text);
        let finalResponseText = aiResponse.text;

        // 4. Handle Actions (Calendly)
        if (aiResponse.action === 'CHECK_CALENDLY') {
            const slots = await CalendlyService.checkAvailability();
            if (slots.length > 0) {
                const slotTimes = slots.map(s => new Date(s.startTime).toLocaleTimeString()).join(', ');
                finalResponseText = `I have the following times available tomorrow: ${slotTimes}. Would you like to book one?`;
            } else {
                finalResponseText = "I'm afraid I don't have any slots available tomorrow. Can we check another day?";
            }
        }

        // 5. Save Inbound Interaction
        await prisma.interaction.create({
            data: {
                leadId: lead.id,
                type: 'CHAT',
                direction: 'INBOUND',
                content: text
            }
        });

        // 6. Save Outbound Interaction
        await prisma.interaction.create({
            data: {
                leadId: lead.id,
                type: 'CHAT',
                direction: 'OUTBOUND',
                content: finalResponseText
            }
        });

        // 7. Send Reply via Platform API (Mocked for now)
        await this.sendReplyToPlatform(platform, socialId, finalResponseText);

        return finalResponseText;
    }

    private static async sendReplyToPlatform(platform: string, recipientId: string, text: string) {
        // Mock sending to FB/WhatsApp
        console.log(`[ChatService] Sending reply to ${platform} user ${recipientId}: ${text}`);

        if (platform === 'FACEBOOK') {
            // Example FB API call (commented out)
            /*
            await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`, {
                recipient: { id: recipientId },
                message: { text }
            });
            */
        }
    }
}
