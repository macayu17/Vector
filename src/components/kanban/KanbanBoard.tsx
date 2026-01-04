'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { APPLICATION_STATUSES, ApplicationStatus, Application, STATUS_CONFIG } from '@/types';
import { useApplicationStore } from '@/store/applicationStore';
import { JobCard } from './JobCard';
import { JobEditModal } from './JobEditModal';
import { AddJobModal } from './AddJobModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

// Status tab configuration
const STATUS_TABS: { status: ApplicationStatus; icon: string }[] = [
    { status: 'WISHLIST', icon: '📋' },
    { status: 'APPLIED', icon: '📤' },
    { status: 'OA_RECEIVED', icon: '📝' },
    { status: 'INTERVIEW_SCHEDULED', icon: '🎯' },
    { status: 'OFFER', icon: '🎉' },
    { status: 'REJECTED', icon: '❌' },
    { status: 'STALLED', icon: '⏸️' },
];

// Drop zone component for moving cards
function DropZone({ status, icon, label }: { status: ApplicationStatus; icon: string; label: string }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        border-2 border-dashed transition-all cursor-default
        ${isOver
                    ? 'border-primary bg-primary/10 text-primary scale-105'
                    : 'border-border/50 text-muted-foreground hover:border-border'
                }
      `}
        >
            <span>{icon}</span>
            <span>Move to {label}</span>
        </div>
    );
}

// Droppable area for current tab
function DroppableArea({
    status,
    applications,
    onCardClick,
    onAddClick
}: {
    status: ApplicationStatus;
    applications: Application[];
    onCardClick: (app: Application) => void;
    onAddClick: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const applicationIds = applications.map((app) => app.id);

    return (
        <div
            ref={setNodeRef}
            className={`
        min-h-[400px] p-6 rounded-2xl glass-card
        transition-all
        ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
      `}
        >
            <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
                {applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <span className="text-3xl opacity-50">📭</span>
                        </div>
                        <p className="text-muted-foreground mb-4">No applications in this category</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddClick}
                            className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                        >
                            <Plus className="h-4 w-4" />
                            Add Application
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {applications.map((application) => (
                            <JobCard
                                key={application.id}
                                application={application}
                                onClick={() => onCardClick(application)}
                            />
                        ))}
                    </div>
                )}
            </SortableContext>
        </div>
    );
}

export function KanbanBoard() {
    const { applications, moveApplication } = useApplicationStore();
    const [activeTab, setActiveTab] = useState<ApplicationStatus>('WISHLIST');
    const [activeApplication, setActiveApplication] = useState<Application | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Fix hydration mismatch by only rendering DndContext on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const getCount = (status: ApplicationStatus) =>
        applications.filter((app) => app.status === status).length;

    const activeApplications = applications.filter((app) => app.status === activeTab);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const application = applications.find((app) => app.id === active.id);
        if (application) {
            setActiveApplication(application);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveApplication(null);

        if (!over) return;

        const applicationId = active.id as string;
        const newStatus = over.id as ApplicationStatus;

        if (APPLICATION_STATUSES.includes(newStatus)) {
            const application = applications.find((app) => app.id === applicationId);
            if (application && application.status !== newStatus) {
                moveApplication(applicationId, newStatus);
                setActiveTab(newStatus);
            }
        }
    };

    const handleCardClick = (application: Application) => {
        setSelectedApplication(application);
        setIsEditModalOpen(true);
    };

    // Show loading state until client-side hydration is complete
    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Status Tabs */}
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-1 mb-6">
                    <div className="flex gap-1 overflow-x-auto">
                        {STATUS_TABS.map(({ status, icon }) => {
                            const count = getCount(status);
                            const isActive = activeTab === status;

                            return (
                                <button
                                    key={status}
                                    onClick={() => setActiveTab(status)}
                                    className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                    rounded-lg transition-all whitespace-nowrap
                    ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }
                  `}
                                >
                                    <span>{icon}</span>
                                    <span className="hidden sm:inline">{STATUS_CONFIG[status].label}</span>
                                    {count > 0 && (
                                        <span className={`
                      px-1.5 py-0.5 text-xs rounded-full min-w-[20px] text-center
                      ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}
                    `}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span>{STATUS_TABS.find(t => t.status === activeTab)?.icon}</span>
                            {STATUS_CONFIG[activeTab].label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {activeApplications.length} {activeApplications.length === 1 ? 'application' : 'applications'}
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Add Application
                    </Button>
                </div>

                {/* Drop zones for other statuses */}
                {activeApplication && (
                    <div className="flex flex-wrap gap-2 mb-4 p-4 rounded-xl bg-muted/30 border border-dashed border-border">
                        <p className="text-sm text-muted-foreground w-full mb-2">Drop here to change status:</p>
                        {STATUS_TABS.filter(({ status }) => status !== activeTab).map(({ status, icon }) => (
                            <DropZone key={status} status={status} icon={icon} label={STATUS_CONFIG[status].label} />
                        ))}
                    </div>
                )}

                {/* Applications Grid */}
                <DroppableArea
                    status={activeTab}
                    applications={activeApplications}
                    onCardClick={handleCardClick}
                    onAddClick={() => setIsAddModalOpen(true)}
                />

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeApplication ? (
                        <div className="opacity-95 rotate-2 scale-105">
                            <JobCard application={activeApplication} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modals */}
            <JobEditModal
                application={selectedApplication}
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedApplication(null);
                }}
            />
            <AddJobModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                defaultStatus={activeTab}
            />
        </>
    );
}
