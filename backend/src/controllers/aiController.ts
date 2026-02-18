import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

const getGeminiModel = async () => {
    const apiKey = await prisma.appSetting.findUnique({ where: { key: 'GEMINI_API_KEY' } });
    if (!apiKey || !apiKey.value) {
        throw new Error("Gemini API Key not configured");
    }
    const genAI = new GoogleGenerativeAI(apiKey.value);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
};
