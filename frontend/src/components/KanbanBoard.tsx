"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api, Lead } from '../lib/api';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';

const COLUMNS = ['NEW', 'CONTACTING', 'REPLIED', 'BOOKED', 'CLOSED'];

// Sortable Item Component
function SortableLead({ lead }: { lead: Lead }) {
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
            className={clsx(
                "bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 mb-3 cursor-grab active:cursor-grabbing group hover:border-blue-500 transition-colors",
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

            // Optimistic Update
            const previousLeads = [...leads];
            setLeads(currentLeads => currentLeads.map(l =>
                l.id === activeId ? { ...l, status: newStatus } : l
            ));

            // API Call
            try {
                await api.updateLeadStage(activeId, newStatus);
            } catch (error) {
                console.error("Failed to update status", error);
                // Revert
                setLeads(previousLeads);
            }
        }
    };

    return (
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
                                    <SortableLead key={lead.id} lead={lead} />
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
    );
}
