"use client";

import { Sidebar } from "../../components/Sidebar";
import { KanbanBoard } from "../../components/KanbanBoard";

export default function LeadsPage() {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Pipeline</h1>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Auto-Sync Active</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + Add Lead
                    </button>
                </header>
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard />
                </div>
            </main>
        </div>
    );
}
