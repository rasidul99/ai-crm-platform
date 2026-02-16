"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../lib/api';
import { Info } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const keys = [
        {
            key: 'GEMINI_API_KEY',
            label: 'Gemini API Key',
            type: 'password',
            description: "Used for the AI chat agent to understand user intent, detect languages, and generate smart replies."
        },
        {
            key: 'VAPI_API_KEY',
            label: 'Vapi API Key',
            type: 'password',
            description: "Used to power the AI Voice Agent for handling automated inbound and outbound phone calls."
        },
        {
            key: 'CALENDLY_TOKEN',
            label: 'Calendly Token',
            type: 'password',
            description: "Used to check your availability and automatically book meetings directly from the chat."
        },
        {
            key: 'APIFY_TOKEN',
            label: 'Apify Token',
            type: 'password',
            description: "Used by the automated Lead Scraper to securely extract public lead data from social media platforms."
        }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string) => {
        setSaving(key);
        try {
            await api.updateSettings(key, value);
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (error) {
            console.error('Failed to save setting', error);
            alert('Failed to save setting');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

                    <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Integrations</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Manage your third-party API keys securely.
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading settings...</div>
                            ) : (
                                keys.map(({ key, label, type, description }) => (
                                    <div key={key} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {label}
                                            </label>
                                            <div className="group relative flex items-center">
                                                <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 p-3 bg-gray-900/95 backdrop-blur text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-white/10">
                                                    {description}
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900/95"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                type={type}
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={settings[key] || ''}
                                                onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                                placeholder={`Enter your ${label}`}
                                            />
                                            <button
                                                onClick={() => handleSave(key, settings[key] || '')}
                                                disabled={saving === key}
                                                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all min-w-[80px]"
                                            >
                                                {saving === key ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
