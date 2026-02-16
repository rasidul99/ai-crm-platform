"use client";

import { Sidebar } from "../../components/Sidebar";

export default function CompliancePage() {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 flex items-center px-6 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Data Compliance</h1>
                </header>
                <div className="p-6">
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Blocklist Management</h3>
                        <p className="text-sm text-gray-500 mb-4">Add emails or domains to exclude from scraping and outreach.</p>

                        <div className="flex gap-2 mb-4">
                            <input type="text" placeholder="Enter email or domain..." className="flex-1 p-2 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-900 dark:text-white" />
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg">Block</button>
                        </div>

                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-500">
                                <tr>
                                    <th className="p-3">Value</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Date Added</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Mock Data */}
                                <tr className="border-t border-gray-100 dark:border-zinc-800">
                                    <td className="p-3">competitor.com</td>
                                    <td className="p-3"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">DOMAIN</span></td>
                                    <td className="p-3 text-gray-500">Oct 24, 2025</td>
                                    <td className="p-3 text-red-500 cursor-pointer">Unblock</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scrape Logs</h3>
                        <p className="text-sm text-gray-500">Recent scraping activity.</p>
                        {/* Table placeholder */}
                    </div>
                </div>
            </main>
        </div>
    );
}
