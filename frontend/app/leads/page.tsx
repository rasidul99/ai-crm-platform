"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { api, Lead } from "../../lib/api";
import { Eye, Calendar, Mail, Phone, Sparkles, BarChart3, X, ChevronDown } from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from 'react-hot-toast';
import { EditLeadModal } from "../../components/EditLeadModal";
import { CreateLeadModal } from "../../components/CreateLeadModal";

const STATUS_OPTIONS = ['NEW', 'CONTACTING', 'REPLIED', 'BOOKED', 'CLOSED', 'ARCHIVED'];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [aiOutput, setAiOutput] = useState<{ title: string; content: string } | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

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

    const handleGenerateEmail = async () => {
        if (!selectedLead) return;
        setAiLoading('email');
        try {
            const data = await api.generateEmail(selectedLead.id);
            setAiOutput({ title: 'Draft Email', content: data.email });
        } catch (error) {
            console.error("Failed to generate email", error);
            toast.error((error as any).response?.data?.error || "Failed to generate email");
        } finally {
            setAiLoading(null);
        }
    };

    const handleScoreLead = async () => {
        if (!selectedLead) return;
        setAiLoading('score');
        try {
            const data = await api.scoreLead(selectedLead.id);
            toast.success(data.message);
            // Update local state
            setSelectedLead(prev => prev ? { ...prev, score: data.score } : null);
            setLeads(current => current.map(l => l.id === selectedLead.id ? { ...l, score: data.score } : l));
        } catch (error) {
            console.error("Failed to score lead", error);
            toast.error((error as any).response?.data?.error || "Failed to score lead");
        } finally {
            setAiLoading(null);
        }
    };

    const handlePlanCall = async () => {
        if (!selectedLead) return;
        setAiLoading('plan');
        try {
            const data = await api.planCall(selectedLead.id);
            setAiOutput({ title: 'Call Plan', content: data.plan });
        } catch (error) {
            console.error("Failed to plan call", error);
            toast.error((error as any).response?.data?.error || "Failed to plan call");
        } finally {
            setAiLoading(null);
        }
    };

    const handleAnalyzeLead = async () => {
        if (!selectedLead) return;
        setAiLoading('analyze');
        try {
            const data = await api.analyzeLead(selectedLead.id);
            setAiOutput({ title: 'Lead Analysis', content: data.analysis });
        } catch (error) {
            console.error("Failed to analyze lead", error);
            toast.error((error as any).response?.data?.error || "Failed to analyze lead");
        } finally {
            setAiLoading(null);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: "break-words text-sm",
                    style: {
                        maxWidth: '400px',
                        wordBreak: 'break-word'
                    }
                }}
            />
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Leads</h1>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Auto-Sync Active</span>
                    </div>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
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
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">AI Score</th>
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
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                {lead.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className={clsx("font-semibold", {
                                                        'text-green-600': lead.score >= 80,
                                                        'text-yellow-600': lead.score >= 50 && lead.score < 80,
                                                        'text-red-600': lead.score < 50
                                                    })}>{lead.score}</span>
                                                    <span className="text-xs text-gray-400">/ 100</span>
                                                </div>
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
                                        <button
                                            onClick={handleScoreLead}
                                            disabled={!!aiLoading}
                                            className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50"
                                        >
                                            <BarChart3 className="w-4 h-4 text-blue-500" />
                                            {aiLoading === 'score' ? 'Scoring...' : 'Score Lead'}
                                        </button>
                                        <button
                                            onClick={handleAnalyzeLead}
                                            disabled={!!aiLoading}
                                            className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50"
                                        >
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            {aiLoading === 'analyze' ? 'Analyzing...' : 'Analyze Intent'}
                                        </button>
                                        <button
                                            onClick={handleGenerateEmail}
                                            disabled={!!aiLoading}
                                            className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50"
                                        >
                                            <Mail className="w-4 h-4 text-green-500" />
                                            {aiLoading === 'email' ? 'Drafting...' : 'Draft Email'}
                                        </button>
                                        <button
                                            onClick={handlePlanCall}
                                            disabled={!!aiLoading}
                                            className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50"
                                        >
                                            <Phone className="w-4 h-4 text-orange-500" />
                                            {aiLoading === 'plan' ? 'Planning...' : 'Plan Call'}
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
                                <button
                                    onClick={() => setEditModalOpen(true)}
                                    className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 transition-all shadow-md"
                                >
                                    Edit Lead Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <EditLeadModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    lead={selectedLead}
                    onSuccess={() => {
                        loadLeads();
                        // Also update selectedLead if needed, or close details drawer
                        toast.success("Lead details updated");
                        // Ideally we should refetch selectedLead or update it locally 
                        if (selectedLead) {
                            // Quick re-fetch or manual update
                            api.getLeads().then(data => {
                                // update main list
                                setLeads(data);
                                // update selected lead view
                                const updated = data.find(l => l.id === selectedLead.id);
                                if (updated) setSelectedLead(updated);
                            });
                        }
                    }}
                />

                <CreateLeadModal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={() => {
                        loadLeads();
                        toast.success("Lead created successfully");
                    }}
                />

                {/* AI Output Modal */}
                {aiOutput && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-zinc-800">
                            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    {aiOutput.title}
                                </h3>
                                <button
                                    onClick={() => setAiOutput(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {aiOutput.content}
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setAiOutput(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(aiOutput.content);
                                        toast.success("Copied to clipboard");
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}