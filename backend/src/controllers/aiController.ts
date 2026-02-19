import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

const prisma = new PrismaClient();

const getGeminiModel = async () => {
    const apiKey = await prisma.appSetting.findUnique({ where: { key: 'GEMINI_API_KEY' } });
    if (!apiKey || !apiKey.value) {
        throw new Error("Gemini API Key not configured");
    }
    const genAI = new GoogleGenerativeAI(apiKey.value);
    return genAI.getGenerativeModel({ model: "gemini-pro" });
};

export const aiController = {
    generateEmail: async (req: Request, res: Response) => {
        try {
            const { leadId } = req.body;
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });

            if (!lead) {
                return res.status(404).json({ error: "Lead not found" });
            }

            const model = await getGeminiModel();
            const prompt = `Write a personalized, professional outreach email for a potential client named ${lead.name}. 
            Their status is ${lead.status}. 
            Context: We are an AI Lead Generation Agency. 
            Highlight how we can help them scale using AI automation. keep it concise and friendly.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            res.json({ email: text });
        } catch (error: any) {
            console.error("AI Email Generation Error:", error);
            res.status(500).json({ error: error.message || "Failed to generate email" });
        }
    },

    analyzeLead: async (req: Request, res: Response) => {
        try {
            const { leadId } = req.body;
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });

            if (!lead) {
                return res.status(404).json({ error: "Lead not found" });
            }

            const model = await getGeminiModel();
            const prompt = `Analyze this lead for a CRM system:
            Name: ${lead.name}
            Email: ${lead.email || 'N/A'}
            Phone: ${lead.phone || 'N/A'}
            Status: ${lead.status}
            Source: ${lead.source}
            
            Provide a JSON output with the following structure (do not include markdown ticks):
            {
                "intent_level": "High/Medium/Low",
                "suggested_action": "Action to take",
                "key_talking_points": ["Point 1", "Point 2"],
                "estimated_value": "$Value"
            }
            Just provide the analysis in text format if JSON is too complex, but keep it structured.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            res.json({ analysis: text });

        } catch (error: any) {
            console.error("AI Analysis Error:", error);
            res.status(500).json({ error: error.message || "Failed to analyze lead" });
        }
    }
    ,

    scoreLead: async (req: Request, res: Response) => {
        try {
            const { leadId } = req.body;
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });

            if (!lead) {
                return res.status(404).json({ error: "Lead not found" });
            }

            const model = await getGeminiModel();
            const prompt = `Evaluate this lead and provide a score from 0-100 based on their likelihood to convert.
            Name: ${lead.name}
            Status: ${lead.status}
            Source: ${lead.source}
            Email: ${lead.email || 'N/A'}

            Return ONLY a number (0-100).`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            const score = parseInt(text.replace(/[^0-9]/g, '')) || 50;

            // Update lead score
            await prisma.lead.update({
                where: { id: leadId },
                data: { score }
            });

            res.json({ score, message: `Lead scored: ${score}` });

        } catch (error: any) {
            console.error("AI Score Error:", error);
            res.status(500).json({ error: error.message || "Failed to score lead" });
        }
    },

    planCall: async (req: Request, res: Response) => {
        try {
            const { leadId } = req.body;
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });

            if (!lead) {
                return res.status(404).json({ error: "Lead not found" });
            }

            if (!lead.phone) {
                return res.status(400).json({ error: "Lead has no phone number" });
            }

            const vapiKey = await prisma.appSetting.findUnique({ where: { key: 'VAPI_API_KEY' } });
            if (!vapiKey || !vapiKey.value) {
                throw new Error("Vapi API Key not configured");
            }

            // Initiate Call via Vapi
            // Using inline assistant config to avoid pre-created ID issues
            const response = await axios.post('https://api.vapi.ai/call', {
                customer: { number: lead.phone },
                assistant: {
                    firstMessage: "Hello, this is the AI assistant from TechGrowth Solutions. Do you have a moment?",
                    model: {
                        provider: "openai",
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "You are a helpful assistant for a Lead Generation Agency. Briefly explain our services and ask to book a meeting."
                            }
                        ]
                    },
                    voice: {
                        provider: "11labs",
                        voiceId: "21m00Tcm4TlvDq8ikWAM",
                    },
                    transcriber: {
                        provider: "deepgram",
                        model: "nova-2",
                        language: "en"
                    }
                },
            }, {
                headers: {
                    'Authorization': `Bearer ${vapiKey.value}`,
                    'Content-Type': 'application/json'
                }
            });

            res.json({ plan: `Call initiated with Vapi!\nCall ID: ${response.data.id}\nStatus: ${response.data.status}` });

        } catch (error: any) {
            console.error("Vapi Plan Call Error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to initiate call";
            res.status(500).json({ error: msg });
        }
    }
};
