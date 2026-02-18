"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAnalytics = async (req, res) => {
    try {
        // 1. Total Leads
        const totalLeads = await prisma.lead.count();
        // 2. Leads by Status (for Funnel/Pipeline view)
        const leadsByStatus = await prisma.lead.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });
        // Format for frontend (e.g., Recharts)
        const statusDistribution = leadsByStatus.map(item => ({
            name: item.status,
            value: item._count.id
        }));
        // 3. Recent Activity (Interactions)
        const recentActivity = await prisma.interaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                lead: {
                    select: { name: true, email: true }
                }
            }
        });
        // 4. Conversion Rate (Closed / Total)
        const closedLeads = await prisma.lead.count({ where: { status: 'CLOSED' } });
        const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;
        res.json({
            totalLeads,
            statusDistribution,
            recentActivity,
            conversionRate: conversionRate.toFixed(1)
        });
    }
    catch (error) {
        console.error('[Analytics] Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
exports.getAnalytics = getAnalytics;
