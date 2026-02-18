"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api, Lead } from '../lib/api';
import clsx from 'clsx';
import { GripVertical, X, Sparkles, Mail, BarChart3, Phone, Calendar } from 'lucide-react';

const COLUMNS = ['NEW', 'CONTACTING', 'REPLIED', 'BOOKED', 'CLOSED'];

// Sortable Item Component
function SortableLead({ lead, onClick }: { lead: Lead, onClick: (lead: Lead) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id, data: { ...lead } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(lead)}
            className={clsx(
                "bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 mb-3 cursor-pointer active:cursor-grabbing group hover:border-blue-500 transition-colors relative",
                isDragging && "opacity-50"
            )}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{lead.name}</h4>
                <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
            </div>
            {lead.email && <p className="text-xs text-gray-500 mt-1 truncate">{lead.email}</p>}
            {lead.phone && <p className="text-xs text-gray-400">{lead.phone}</p>}
            <div className="mt-3 flex justify-between items-center text-xs">
                <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 font-mono">
                    Score: {lead.score}
                </span>
                <span className="text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
}

function KanbanColumn({ column, leads, children }: { column: string, leads: Lead[], children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: column,
    });

    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-80 bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col">
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950 rounded-t-xl sticky top-0 z-10">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <span className={clsx("w-2 h-2 rounded-full", {
                        'bg-blue-500': column === 'NEW',
                        'bg-yellow-500': column === 'CONTACTING',
                        'bg-purple-500': column === 'REPLIED',
                        'bg-green-500': column === 'BOOKED',
                        'bg-gray-500': column === 'CLOSED' || column === 'ARCHIVED',
                    })}></span>
                    {column}
                </h3>
                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                    {leads.filter(l => l.status === column).length}
                </span>
            </div>
            {children}
        </div>
    );
}

export function KanbanBoard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Fetch Leads
    useEffect(() => {
        api.getLeads().then(setLeads).catch(console.error);
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeLead = leads.find(l => l.id === activeId);
        if (!activeLead) return;

        // If dropping on a column
        if (COLUMNS.includes(overId as string)) {
            // We could optimistically move it nicely here, but dragEnd handles the actual logic.
            // Just ensure we don't crash.
            return;
        }

        // Behavior for dropping on other items (reordering) could be added here
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Always reset activeId at the end of the interaction
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeLead = leads.find(l => l.id === activeId);
        if (!activeLead) return;

        let newStatus = activeLead.status;

        // Determine new status based on drop target
        if (COLUMNS.includes(overId)) {
            // Dropped on the column container directly
            newStatus = overId as any;
        } else {
            // Dropped on another card
            const overLead = leads.find(l => l.id === overId);
            if (overLead) {
                newStatus = overLead.status;
            }
        }

        if (activeLead.status !== newStatus) {
            console.log(`Moving lead ${activeId} from ${activeLead.status} to ${newStatus}`);

            // Optimistic Update: Create a new array and new object for the updated lead
            const previousLeads = [...leads];
            setLeads(currentLeads => currentLeads.map(l =>
                l.id === activeId ? { ...l, status: newStatus } : l
            ));

            // API Call
            try {
                const updatedLead = await api.updateLeadStage(activeId, newStatus);
                // Confirm state with server response (optional but good practice)
                setLeads(currentLeads => currentLeads.map(l =>
                    l.id === activeId ? updatedLead : l
                ));
            } catch (error) {
                console.error("Failed to update status", error);
                // Revert on failure
                setLeads(previousLeads);
            }
        }
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full overflow-x-auto gap-4 p-4">
                    {COLUMNS.map(column => (
                        <KanbanColumn key={column} column={column} leads={leads}>
                            {/* Sortable Area */}
                            <SortableContext
                                id={column} // The column itself is a sortable container
                                items={leads.filter(l => l.status === column).map(l => l.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex-1 p-3 overflow-y-auto min-h-[150px]">
                                    {leads.filter(l => l.status === column).map(lead => (
                                        <SortableLead key={lead.id} lead={lead} onClick={setSelectedLead} />
                                    ))}
                                </div>
                            </SortableContext>
                        </KanbanColumn>
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-xl border border-blue-500 rotate-2 cursor-grabbing">
                            {/* Simplified overlay preview */}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {leads.find(l => l.id === activeId)?.name}
                            </h4>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Lead Details Drawer */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedLead(null)}
                    />

                    {/* Slide-over Panel */}
                    <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 h-full shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300 flex flex-col">

                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-start bg-white dark:bg-zinc-950 sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLead.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
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

                        {/* Content */}
                        <div className="p-6 space-y-8 flex-1">

                            {/* AI Actions */}
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

                            {/* Contact Info */}
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

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                            <button className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
                                Edit Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
