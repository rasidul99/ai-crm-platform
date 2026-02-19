import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
    createLead: async (data: Partial<Lead>) => {
        const response = await axios.post(`${API_URL}/leads`, data);
        return response.data;
    },
    updateLeadStage: async (id: string, status: string) => {
        const response = await axios.patch(`${API_URL}/leads/${id}/stage`, { status });
        return response.data;
    },
    updateLead: async (id: string, data: Partial<Lead>) => {
        const response = await axios.patch(`${API_URL}/leads/${id}`, data);
        return response.data;
    },

    // Analytics
    getAnalytics: async () => {
        const response = await axios.get<AnalyticsData>(`${API_URL}/analytics`);
        return response.data;
    },

    // Settings
    getSettings: async () => {
        const response = await axios.get<Record<string, string>>(`${API_URL}/settings`);
        return response.data;
    },
    updateSettings: async (key: string, value: string) => {
        const response = await axios.post(`${API_URL}/settings`, { key, value });
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
    },

    // AI Features
    generateEmail: async (leadId: string) => {
        const response = await axios.post(`${API_URL}/ai/generate-email`, { leadId });
        return response.data;
    },
    analyzeLead: async (leadId: string) => {
        const response = await axios.post(`${API_URL}/ai/analyze-lead`, { leadId });
        return response.data;
    },
    scoreLead: async (leadId: string) => {
        const response = await axios.post(`${API_URL}/ai/score-lead`, { leadId });
        return response.data;
    },
    planCall: async (leadId: string) => {
        const response = await axios.post(`${API_URL}/ai/plan-call`, { leadId });
        return response.data;
    }
};
