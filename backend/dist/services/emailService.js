"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
// Configure Nodemailer Transport
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
class EmailService {
    // Send a single email
    static async sendEmail(to, subject, html) {
        if (!to)
            return false;
        try {
            const info = await transporter.sendMail({
                from: `"AI CRM" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
            console.log(`[Email Service] Message sent: ${info.messageId}`);
            return true;
        }
        catch (error) {
            console.error('[Email Service] Error sending email:', error);
            return false;
        }
    }
    // Generate the 6-step follow-up sequence (for DB scheduling)
    static generateSequence(leadId, startDate = new Date()) {
        const sequence = [
            { dayOffset: 0, type: 'EMAIL', content: 'Intro: Assessing your needs...' },
            { dayOffset: 2, type: 'EMAIL', content: 'Follow-up 1: Quick question...' },
            { dayOffset: 5, type: 'EMAIL', content: 'Value add: Here is a case study...' },
            { dayOffset: 9, type: 'EMAIL', content: 'Checking in...' },
            { dayOffset: 14, type: 'EMAIL', content: 'Last attempt...' },
            { dayOffset: 30, type: 'EMAIL', content: 'Re-engaging in a month...' },
        ];
        return sequence.map(step => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + step.dayOffset);
            return {
                leadId,
                type: step.type,
                direction: 'OUTBOUND',
                content: step.content,
                createdAt: date, // Using createdAt as scheduledAt for now, or we can add a specific field later
                metadata: { status: 'SCHEDULED' }
            };
        });
    }
}
exports.EmailService = EmailService;
