"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// System Prompt for the AI Voice Assistant
const SYSTEM_PROMPT = `
You remain an AI assistant for "TechGrowth Solutions", a lead generation agency.
Your goal is to:
1. Briefly explain our services (Web Dev, SEO, AI Automation).
2. Ask the user about their current challenges.
3. If they seem interested, offer to book a meeting for a free audit.

Rules:
- Be concise and conversational.
- If they say "yes" to a meeting, ask for a preferred time (morning/afternoon).
- If they are not interested, politely thank them and end the call.
- Do not make up facts.
`;
class VoiceService {
    // Return Vapi Configuration (to be used when creating/updating the assistant)
    static getAssistantConfig() {
        return {
            name: "TechGrowth Assistant",
            voice: {
                provider: "11labs",
                voiceId: "21m00Tcm4TlvDq8ikWAM", // Example Voice ID
                stability: 0.5,
                similarityBoost: 0.75
            },
            model: {
                model: "gpt-4",
                systemPrompt: SYSTEM_PROMPT,
                temperature: 0.7
            },
            transcriber: {
                provider: "deepgram",
                model: "nova-2",
                language: "en"
            },
            firstMessage: "Hello, this is the AI assistant from TechGrowth Solutions. Do you have a moment?"
        };
    }
    // Process Post-Call Webhook Data
    static async processCallResult(payload) {
        console.log('[VoiceService] Processing call result:', payload.message?.type);
        const { message } = payload;
        if (!message || message.type !== 'end-of-call-report') {
            return;
        }
        const { summary, transcript, recordingUrl, analysis, // Vapi can provide analysis if configured
        customer, endedReason } = message;
        const phoneNumber = customer?.number;
        if (!phoneNumber) {
            console.warn('[VoiceService] No phone number in call report.');
            return;
        }
        // 1. Find or Create Lead based on Phone
        let lead = await prisma.lead.findFirst({
            where: { phone: phoneNumber }
        });
        if (!lead) {
            lead = await prisma.lead.create({
                data: {
                    phone: phoneNumber,
                    status: 'NEW',
                    source: 'MANUAL', // Or 'VAPI_INBOUND'
                    name: 'Voice Lead ' + phoneNumber.slice(-4)
                }
            });
        }
        // 2. Determine Outcome & Update Status
        // Logic: specific Vapi analysis or keyword search in summary
        const isBooked = summary?.toLowerCase().includes('book') || summary?.toLowerCase().includes('scheduled');
        const isReplied = endedReason === 'customer-ended-call' || endedReason === 'assistant-ended-call'; // Successful connection
        let newStatus = lead.status;
        if (isBooked) {
            newStatus = 'BOOKED';
        }
        else if (isReplied && lead.status === 'NEW' || lead.status === 'CONTACTING') {
            newStatus = 'REPLIED'; // They picked up and talked
        }
        if (newStatus !== lead.status) {
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: newStatus }
            });
        }
        // 3. Save Interaction
        await prisma.interaction.create({
            data: {
                leadId: lead.id,
                type: 'CALL',
                direction: 'OUTBOUND', // Assuming primarily outbound for now
                content: summary || "Call completed",
                metadata: {
                    recordingUrl,
                    transcript,
                    duration: message.durationSeconds,
                    cost: message.cost,
                    endedReason
                }
            }
        });
        console.log(`[VoiceService] Processed call for ${phoneNumber}. Status: ${newStatus}`);
    }
}
exports.VoiceService = VoiceService;
