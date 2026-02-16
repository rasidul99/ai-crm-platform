"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { AnalyticsCharts } from "../components/AnalyticsCharts";
import { api, AnalyticsData } from "../lib/api";

export default function Home() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAnalytics()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Overview</h1>
                    <div className="h-8 w-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full"></div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : data ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {/* Stats Card 1 */}
                                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Leads</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.totalLeads}</h3>
                                </div>

                                {/* Stats Card 2 */}
                                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.conversionRate}%</h3>
                                </div>

                                {/* Stats Card 3 */}
                                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Pipeline</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {data.statusDistribution.reduce((acc, curr) => curr.name !== 'CLOSED' && curr.name !== 'ARCHIVED' ? acc + curr.value : acc, 0)}
                                    </h3>
                                </div>

                                {/* Stats Card 4 */}
                                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Meetings Booked</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {data.statusDistribution.find(d => d.name === 'BOOKED')?.value || 0}
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Charts */}
                                <div className="lg:col-span-2">
                                    <AnalyticsCharts data={data.statusDistribution} />
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                                    <div className="space-y-4">
                                        {data.recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-zinc-800 last:border-0 last:pb-0">
                                                <div className={clsx(
                                                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                    activity.type === 'CALL' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {activity.type === 'CALL' ? 'C' : 'M'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {activity.lead?.name || 'Unknown Lead'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{activity.content}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {data.recentActivity.length === 0 && (
                                            <p className="text-sm text-gray-500">No recent activity.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-red-500">Failed to load data. Ensure backend is running.</div>
                    )}
                </div>
            </main>
        </div>
    );
}
