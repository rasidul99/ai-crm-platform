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

            const model = await getGeminiModel();
            const prompt = `Create a detailed cold call script and strategy for this lead:
            Name: ${lead.name}
            Company: ${lead.name} (Assume company name if similar)
            Status: ${lead.status}
            Source: ${lead.source}
            
            Structure the response as:
            1. Pre-Call Research (What to look for)
            2. The Hook (Opening line)
            3. Value Prop (Pitch)
            4. Common Objections & Rebuttals
            5. Closing (Asking for the meeting)
            
            Keep it professional and persuasive.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            res.json({ plan: text });

        } catch (error: any) {
            console.error("AI Plan Call Error:", error);
            res.status(500).json({ error: error.message || "Failed to plan call" });
        }
    }
};
