import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import leadRoutes from './routes/leadRoutes';
import automationRoutes from './routes/automationRoutes';
import webhookRoutes from './routes/webhookRoutes';
import voiceRoutes from './routes/voiceRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || ''
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked CORS for origin: ${origin}`);
            callback(null, false); // Fail checking but don't crash
        }
    },
    credentials: true
}));
app.use(express.json());

app.use('/api/leads', leadRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic Heartbeat
app.get('/', (req, res) => {
    res.send('AI Lead Generation CRM API is Running');
});

// Test DB Connection
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Database connection failed', error);
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
