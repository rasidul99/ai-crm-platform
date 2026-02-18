"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
const automationRoutes_1 = __importDefault(require("./routes/automationRoutes"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const voiceRoutes_1 = __importDefault(require("./routes/voiceRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use('/api/leads', leadRoutes_1.default);
app.use('/api/automation', automationRoutes_1.default);
app.use('/api/webhooks', webhookRoutes_1.default);
app.use('/api/voice', voiceRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
// Basic Heartbeat
app.get('/', (req, res) => {
    res.send('AI Lead Generation CRM API is Running');
});
// Test DB Connection
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        console.error('Database connection failed', error);
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
