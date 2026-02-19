import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { SettingsService } from './settingsService';

dotenv.config();

// We can't initialize this globally anymore since key can change
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

export interface AIAnalysisResult {
    intent: string;
    score: number;
    category: string; // e.g., "Web Dev", "Marketing"
    suggestedDraft: string;
}

export class AIService {
    private static async getGenAI() {
        const apiKey = await SettingsService.get('GEMINI_API_KEY');
        if (!apiKey || apiKey === 'mock_key') return null;
        return new GoogleGenerativeAI(apiKey);
    }

    static async analyzeLead(description: string): Promise<AIAnalysisResult> {
        const genAI = await this.getGenAI();

        if (!genAI) {
            console.warn('[AI Service] No valid API Key. Returning mock analysis.');
            return {
                intent: "Interested in update",
                score: 75,
                category: "General",
                suggestedDraft: "Hi, I saw you are looking for updates. We can help."
            };
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
            Analyze the following lead description and return a JSON object with:
            - intent: A short summary of what they need (max 10 words).
            - score: A relevance score from 0-100 (where 100 is a perfect lead for a software development agency).
            - category: The main service category (e.g., Web Development, Mobile App, AI, Design, Marketing).
            - suggestedDraft: A personalized, short cold email opening sentence (max 20 words).

            Description: "${description}"
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Basic cleanup to parse JSON if model wraps in code blocks
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr) as AIAnalysisResult;

        } catch (error) {
            console.error('[AI Service] Analysis failed:', error);
            return {
                intent: "Analysis Failed",
                score: 0,
                category: "Unknown",
                suggestedDraft: "Hello,\n\nWe noticed your profile..."
            };
        }
    }

    // New method for Chatbot
    static async generateChatResponse(history: string[], newMessage: string): Promise<{ text: string, action?: string }> {
        const genAI = await this.getGenAI();

        if (!genAI) {
            return { text: "This is a mock response. I can speak English or Bangla." };
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
                history: history.map(msg => ({ role: "user", parts: [{ text: msg }] })), // Simplified mapping for now
            });

            const prompt = `
            You are a helpful AI assistant for a Lead Generation Agency. 
            Rules:
            1. Detect the user's language (English, Bangla, or Banglish) and reply in the SAME language.
            2. Be professional but friendly.
            3. If the user asks to book a meeting, return a JSON object: { "text": "Sure, let me check availability.", "action": "CHECK_CALENDLY" }. 
               Otherwise, just return the plain text response.
            
            User Message: "${newMessage}"
            `;

            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            let text = response.text();

            // Check for JSON action
            try {
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                if (cleanText.startsWith('{') && cleanText.includes('CHECK_CALENDLY')) {
                    return JSON.parse(cleanText);
                }
            } catch (e) {
                // Not JSON, just normal text
            }

            return { text };

        } catch (error) {
            console.error('[AI Service] Chat generation failed:', error);
            return { text: "I'm having trouble connecting right now. Please try again later." };
        }
    }
}

