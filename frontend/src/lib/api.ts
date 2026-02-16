import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status: 'NEW' | 'CONTACTING' | 'REPLIED' | 'BOOKED' | 'CLOSED' | 'ARCHIVED';
    source: string;
    score: number;
    createdAt: string;
}

export interface AnalyticsData {
    totalLeads: number;
    statusDistribution: { name: string; value: number }[];
    recentActivity: any[];
    conversionRate: string;
}

export const api = {
    // Leads
    getLeads: async () => {
        const response = await axios.get<Lead[]>(`${API_URL}/leads`);
        return response.data;
    },
    updateLeadStage: async (id: string, status: string) => {
        const response = await axios.patch(`${API_URL}/leads/${id}/stage`, { status });
        return response.data;
    },

    // Analytics
    getAnalytics: async () => {
        const response = await axios.get<AnalyticsData>(`${API_URL}/analytics`);
        // Transform data if necessary
        return response.data;
    },

    // Compliance (Mock for now or if endpoints exist)
    getScrapeLogs: async () => {
        // Implement when backend endpoint exists, likely /api/compliance/logs
        return [];
    },
    getBlocklist: async () => {
        // Implement when backend endpoint exists
        return [];
    }
};
