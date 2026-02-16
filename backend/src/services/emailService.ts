import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export class EmailService {
    // Send a single email
    static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        if (!to) return false;

        try {
            const info = await transporter.sendMail({
                from: `"AI CRM" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
            console.log(`[Email Service] Message sent: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('[Email Service] Error sending email:', error);
            return false;
        }
    }

    // Generate the 6-step follow-up sequence (for DB scheduling)
    static generateSequence(leadId: string, startDate: Date = new Date()) {
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
