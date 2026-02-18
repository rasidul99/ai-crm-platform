"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { api, Lead } from "../../lib/api";
import { Eye, Calendar, Mail, Phone, Sparkles, BarChart3, X, ChevronDown } from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';

const STATUS_OPTIONS = ['NEW', 'CONTACTING', 'REPLIED', 'BOOKED', 'CLOSED', 'ARCHIVED'];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const data = await api.getLeads();
            setLeads(data);
        } catch (error) {
            console.error("Failed to load leads", error);
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.status === newStatus) return;

        // Optimistic Update
        const previousLeads = [...leads];
        setLeads(current => current.map(l =>
            l.id === leadId ? { ...l, status: newStatus as any } : l
        ));

        try {
            await api.updateLeadStage(leadId, newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
            setLeads(previousLeads); // Revert
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans">
            <Toaster position="top-right" />
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Leads</h1>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Auto-Sync Active</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + Add Lead
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Created At</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading leads...</td>
                                    </tr>
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No leads found.</td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                                                {lead.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                {lead.email || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative inline-block text-left">
                                                    <select
                                                        value={lead.status}
                                                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                        className={clsx(
                                                            "appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-semibold border-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer outline-none",
                                                            {
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': lead.status === 'NEW',
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300': lead.status === 'CONTACTING',
                                                                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300': lead.status === 'REPLIED',
                                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': lead.status === 'BOOKED',
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': lead.status === 'CLOSED' || lead.status === 'ARCHIVED',
                                                            }
                                                        )}
                                                    >
                                                        {STATUS_OPTIONS.map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
                                                        <ChevronDown className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lead Details Drawer */}
                {selectedLead && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setSelectedLead(null)}
                        />
                        <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 h-full shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300 flex flex-col">
                            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-start bg-white dark:bg-zinc-950 sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLead.name}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                                        <span className={clsx("inline-block w-2 h-2 rounded-full", {
                                            'bg-blue-500': selectedLead.status === 'NEW',
                                            'bg-yellow-500': selectedLead.status === 'CONTACTING',
                                            'bg-purple-500': selectedLead.status === 'REPLIED',
                                            'bg-green-500': selectedLead.status === 'BOOKED',
                                            'bg-gray-500': selectedLead.status === 'CLOSED' || selectedLead.status === 'ARCHIVED',
                                        })}></span>
                                        {selectedLead.status}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8 flex-1">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        AI Assist
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
                                            <BarChart3 className="w-4 h-4 text-blue-500" />
                                            Score Lead
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            Analyze Intent
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
                                            <Mail className="w-4 h-4 text-green-500" />
                                            Draft Email
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
                                            <Phone className="w-4 h-4 text-orange-500" />
                                            Plan Call
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300 text-sm">{selectedLead.email || 'No email provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300 text-sm">{selectedLead.phone || 'No phone provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300 text-sm">Created on {new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                                <button className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
                                    Edit Lead Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}