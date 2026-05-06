'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    pointerWithin,
    rectIntersection,
    useDroppable,
    type CollisionDetection,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { APPLICATION_STATUSES, ApplicationStatus, Application, BoardViewMode, STATUS_CONFIG } from '@/types';
import { useApplicationStore } from '@/store/applicationStore';
import { useTagStore } from '@/store/tagStore';
import { JobCard } from './JobCard';
import { JobEditModal } from './JobEditModal';
import { AddJobModal } from './AddJobModal';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { BulkActionBar } from './BulkActionBar';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, CheckSquare, XSquare, SendHorizontal, FileCheck, Calendar, XCircle, PauseCircle, Heart, LucideIcon, Columns3, List, Save, Bell, Undo2, X } from 'lucide-react';

// Status tab configuration - matches APPLICATION_STATUSES order
const STATUS_TABS: { status: ApplicationStatus; icon: LucideIcon }[] = [
    { status: 'APPLIED', icon: SendHorizontal },
    { status: 'OA_RECEIVED', icon: FileCheck },
    { status: 'INTERVIEW_SCHEDULED', icon: Calendar },
    { status: 'REJECTED', icon: XCircle },
    { status: 'STALLED', icon: PauseCircle },
    { status: 'WISHLIST', icon: Heart },
];

const INITIAL_VISIBLE_COUNT = 60;
const LOAD_MORE_COUNT = 60;

const pointerFirstCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;

    const intersectingCollisions = rectIntersection(args);
    if (intersectingCollisions.length > 0) return intersectingCollisions;

    return closestCenter(args);
};

// Drop zone component for moving cards
function DropZone({ status, icon: Icon, label }: { status: ApplicationStatus; icon: LucideIcon; label: string }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={`
        flex items-center gap-2 border-b px-0 py-2 text-xs font-bold uppercase tracking-[0.12em]
        transition-colors cursor-default
        ${isOver
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }
      `}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-wrap-safe">Move to {label}</span>
        </div>
    );
}

function StageSummaryTile({
    status,
    icon: Icon,
    count,
    onAddClick,
}: {
    status: ApplicationStatus;
    icon: LucideIcon;
    count: number;
    onAddClick: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: `stage:${status}` });
    const hasEntries = count > 0;

    return (
        <div
            ref={setNodeRef}
            className={`
        group flex min-w-0 items-center justify-between gap-3 border-y px-0 py-3 transition-colors
        ${isOver
                    ? 'border-primary bg-secondary/30 text-primary'
                    : hasEntries
                        ? 'border-primary/60 text-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }
      `}
        >
            <div className="flex min-w-0 items-center gap-3">
                <Icon className={hasEntries ? 'h-4 w-4 shrink-0 text-primary' : 'h-4 w-4 shrink-0'} />
                <div className="min-w-0">
                    <p className={`editorial-label text-[10px] ${hasEntries ? 'text-primary' : ''}`}>
                        {STATUS_CONFIG[status].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? 'entry' : 'entries'}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={onAddClick}
                aria-label={`Add application to ${STATUS_CONFIG[status].label}`}
                className="shrink-0"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}

// Droppable area for current tab
function DroppableArea({
    status,
    applications,
    onCardClick,
    onAddClick,
    visibleCount,
    onLoadMore,
}: {
    status: ApplicationStatus;
    applications: Application[];
    onCardClick: (app: Application) => void;
    onAddClick: () => void;
    visibleCount: number;
    onLoadMore: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const visibleApplications = applications.slice(0, visibleCount);
    const applicationIds = visibleApplications.map((app) => app.id);
    const hasMore = applications.length > visibleApplications.length;

    return (
        <div
            ref={setNodeRef}
            className={`
        min-h-[360px]
        transition-colors
        ${isOver ? 'bg-secondary/20' : ''}
      `}
        >
            <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
                {applications.length === 0 ? (
                    <div className="ledger-reveal flex min-h-[320px] flex-col items-start justify-center border-y border-border py-14 text-left sm:items-center sm:text-center">
                        <p className="editorial-label mb-2">Empty stage</p>
                        <h2 className="mb-2 font-serif text-3xl font-semibold text-foreground">No entries here</h2>
                        <p className="mb-5 max-w-sm text-sm text-muted-foreground">
                            Applications in this stage will appear in the ledger.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddClick}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Application
                        </Button>
                    </div>
                ) : (
                    <div className="border-y border-border">
                        {visibleApplications.map((application) => (
                            <JobCard
                                key={application.id}
                                application={application}
                                onClick={() => onCardClick(application)}
                            />
                        ))}
                        {hasMore && (
                            <div className="flex justify-center border-t border-border py-4">
                                <Button variant="outline" size="sm" onClick={onLoadMore}>
                                    Load {Math.min(LOAD_MORE_COUNT, applications.length - visibleApplications.length)} more
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </SortableContext>
        </div>
    );
}

function BoardColumn({
    status,
    applications,
    onCardClick,
    onAddClick,
    visibleCount,
    onLoadMore,
    cardDensity = 'compact',
}: {
    status: ApplicationStatus;
    applications: Application[];
    onCardClick: (app: Application) => void;
    onAddClick: () => void;
    visibleCount: number;
    onLoadMore: () => void;
    cardDensity?: 'comfortable' | 'compact';
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const visibleApplications = applications.slice(0, visibleCount);
    const applicationIds = visibleApplications.map((app) => app.id);
    const hasMore = applications.length > visibleApplications.length;

    return (
        <section
            ref={setNodeRef}
            className={`flex min-w-0 flex-col border-y border-border transition-colors ${isOver ? 'bg-secondary/20' : ''}`}
            aria-label={`${STATUS_CONFIG[status].label} applications`}
        >
            <div className="flex items-start justify-between gap-2 border-b border-border bg-background py-3">
                <div className="min-w-0">
                    <p className="editorial-label text-[10px]">{STATUS_CONFIG[status].label}</p>
                    <p className="text-xs text-muted-foreground">{applications.length} entries</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={onAddClick} aria-label={`Add application to ${STATUS_CONFIG[status].label}`}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
                <div className="max-h-[360px] flex-1 overflow-y-auto overscroll-contain pr-1 md:min-h-[220px] lg:max-h-[56vh]">
                    {visibleApplications.length === 0 ? (
                        <div className="hidden py-6 text-sm text-muted-foreground md:flex md:min-h-[180px] md:items-center">No entries.</div>
                    ) : (
                        visibleApplications.map((application) => (
                            <JobCard
                                key={application.id}
                                application={application}
                                onClick={() => onCardClick(application)}
                                density={cardDensity}
                            />
                        ))
                    )}
                    {hasMore && (
                        <div className="flex justify-center border-t border-border py-4">
                            <Button variant="outline" size="sm" onClick={onLoadMore}>
                                Load more
                            </Button>
                        </div>
                    )}
                </div>
            </SortableContext>
        </section>
    );
}

export function KanbanBoard() {
    const {
        applications,
        moveApplication,
        getFilteredApplications,
        getDueFollowUps,
        selectedIds,
        selectAll,
        clearSelection,
        filters,
        savedViews,
        saveCurrentView,
        applySavedView,
        deleteSavedView,
        lastUndo,
        undoLastAction,
        clearUndo,
    } = useApplicationStore();
    const { fetchTags } = useTagStore();
    const [activeTab, setActiveTab] = useState<ApplicationStatus>('APPLIED');
    const [viewMode, setViewMode] = useState<BoardViewMode>('stage');
    const [dueOnly, setDueOnly] = useState(false);
    const [visibleCounts, setVisibleCounts] = useState<Record<ApplicationStatus, number>>(
        () => Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, INITIAL_VISIBLE_COUNT])) as Record<ApplicationStatus, number>
    );
    const [activeApplication, setActiveApplication] = useState<Application | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Fix hydration mismatch by only rendering DndContext on client
    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsMounted(true));
        fetchTags();

        return () => cancelAnimationFrame(frame);
    }, [fetchTags]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Get filtered applications
    const dueFollowUps = getDueFollowUps();
    const dueIds = new Set(dueFollowUps.map((app) => app.id));
    const filteredApplications = dueOnly
        ? getFilteredApplications().filter((app) => dueIds.has(app.id))
        : getFilteredApplications();
    const hasActiveFilters = filters.searchQuery ||
        filters.statuses.length > 0 ||
        filters.priorities.length > 0 ||
        filters.jobTypes.length > 0 ||
        filters.tags.length > 0 ||
        dueOnly;

    const getCount = (status: ApplicationStatus) =>
        filteredApplications.filter((app) => app.status === status).length;

    const activeApplications = filteredApplications.filter((app) => app.status === activeTab);
    const columnsByStatus = STATUS_TABS.map(({ status, icon }) => ({
        status,
        icon,
        applications: filteredApplications.filter((app) => app.status === status),
    }));
    const populatedColumns = columnsByStatus.filter(({ applications }) => applications.length > 0);
    const boardSubtitle = viewMode === 'columns'
        ? `${filteredApplications.length} ${filteredApplications.length === 1 ? 'application' : 'applications'} across the pipeline`
        : `${activeApplications.length} ${activeApplications.length === 1 ? 'application' : 'applications'} in this stage`;

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
        const overId = over.id as string;
        let newStatus = overId.startsWith('stage:')
            ? overId.replace('stage:', '') as ApplicationStatus
            : overId as ApplicationStatus;

        if (!APPLICATION_STATUSES.includes(newStatus)) {
            const overApplication = applications.find((app) => app.id === overId);
            if (!overApplication) return;
            newStatus = overApplication.status;
        }

        if (APPLICATION_STATUSES.includes(newStatus)) {
            const application = applications.find((app) => app.id === applicationId);
            if (application && application.status !== newStatus) {
                moveApplication(applicationId, newStatus);
                if (viewMode === 'stage') setActiveTab(newStatus);
            }
        }
    };

    const handleCardClick = (application: Application) => {
        setSelectedApplication(application);
        setIsEditModalOpen(true);
    };

    const handleSelectAllVisible = () => {
        const ids = activeApplications.map(app => app.id);
        selectAll(ids);
    };

    const handleSaveView = () => {
        const name = window.prompt('Name this view', STATUS_CONFIG[activeTab].label);
        if (name) saveCurrentView(name, activeTab);
    };

    const applyView = (id: string) => {
        const savedView = applySavedView(id);
        if (savedView) {
            setActiveTab(savedView.activeStatus);
            setDueOnly(false);
        }
    };

    const loadMore = (status: ApplicationStatus) => {
        setVisibleCounts((current) => ({
            ...current,
            [status]: current[status] + LOAD_MORE_COUNT,
        }));
    };

    useEffect(() => {
        const handleOpenAdd = () => setIsAddModalOpen(true);
        const handleOpenDetail = (event: Event) => {
            const { id } = (event as CustomEvent<{ id?: string }>).detail || {};
            const application = applications.find((app) => app.id === id);
            if (application) handleCardClick(application);
        };
        const handleDueView = () => {
            setDueOnly(true);
            setViewMode('stage');
        };

        window.addEventListener('careerflow-open-add-application', handleOpenAdd);
        window.addEventListener('careerflow-open-application-detail', handleOpenDetail);
        window.addEventListener('careerflow-show-due-followups', handleDueView);
        return () => {
            window.removeEventListener('careerflow-open-add-application', handleOpenAdd);
            window.removeEventListener('careerflow-open-application-detail', handleOpenDetail);
            window.removeEventListener('careerflow-show-due-followups', handleDueView);
        };
    }, [applications]);

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
            {/* Search and Filter Bar */}
            <div className="ledger-reveal mb-8 flex min-w-0 flex-wrap items-center gap-4 border-b border-border pb-6">
                <SearchBar />
                <FilterPanel />
                <div className="flex items-center gap-1 border border-border p-1" aria-label="Board view mode">
                    <Button
                        variant={viewMode === 'stage' ? 'secondary' : 'ghost'}
                        size="icon-sm"
                        onClick={() => setViewMode('stage')}
                        aria-label="Stage list view"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'columns' ? 'secondary' : 'ghost'}
                        size="icon-sm"
                        onClick={() => setViewMode('columns')}
                        aria-label="Kanban columns view"
                    >
                        <Columns3 className="h-4 w-4" />
                    </Button>
                </div>
                <Button
                    variant={dueOnly ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setDueOnly((current) => !current)}
                    className="gap-2"
                >
                    <Bell className="h-4 w-4" />
                    Due {dueFollowUps.length}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveView} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save View
                </Button>

                {/* Select all / Deselect buttons */}
                {viewMode === 'stage' && activeApplications.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                        {selectedIds.length === 0 ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground"
                                onClick={handleSelectAllVisible}
                            >
                                <CheckSquare className="h-4 w-4" />
                                Select all
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground"
                                onClick={clearSelection}
                            >
                                <XSquare className="h-4 w-4" />
                                Deselect ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {savedViews.length > 0 && (
                <div className="ledger-reveal -mt-4 mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
                    {savedViews.map((view) => (
                        <span key={view.id} className="inline-flex items-center border border-border">
                            <button
                                type="button"
                                className="editorial-label px-2 py-1 text-[10px] hover:text-primary"
                                onClick={() => applyView(view.id)}
                            >
                                {view.name}
                            </button>
                            <button
                                type="button"
                                className="border-l border-border px-1.5 py-1 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteSavedView(view.id)}
                                aria-label={`Delete saved view ${view.name}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={pointerFirstCollisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {viewMode === 'stage' && (
                    <div className="ledger-reveal ledger-reveal-delayed mb-8 flex gap-4 overflow-x-auto border-b border-border" role="tablist" aria-label="Application stages">
                        {STATUS_TABS.map(({ status, icon: Icon }) => {
                            const count = getCount(status);
                            const isActive = activeTab === status;

                            return (
                                <button
                                    key={status}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => {
                                        setActiveTab(status);
                                        setDueOnly(false);
                                    }}
                                    className={`
                    flex min-w-fit items-center gap-2 border-b px-0 py-4 text-xs font-bold uppercase tracking-[0.12em]
                    transition-colors whitespace-nowrap
                    ${isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                        }
                  `}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{STATUS_CONFIG[status].label}</span>
                                    <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>[ {count} ]</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Header */}
                <div className="ledger-reveal ledger-reveal-delayed mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <p className="editorial-label mb-2">{viewMode === 'columns' ? '§ I — Pipeline' : '§ I — Current stage'}</p>
                        <h2 className="text-wrap-safe flex flex-wrap items-center gap-3 font-serif text-[clamp(1.85rem,4vw,2.5rem)] font-semibold">
                            {viewMode === 'stage' && (() => { const TabIcon = STATUS_TABS.find(t => t.status === activeTab)?.icon; return TabIcon ? <TabIcon className="h-6 w-6 text-primary" /> : null; })()}
                            {viewMode === 'columns' ? 'Kanban Board' : STATUS_CONFIG[activeTab].label}
                            {hasActiveFilters && (
                                <span className="editorial-label text-primary">Filtered</span>
                            )}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {boardSubtitle}
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="shrink-0 gap-2">
                        <Plus className="h-4 w-4" />
                        Add Application
                    </Button>
                </div>

                {/* Drop zones for other statuses */}
                {activeApplication && (
                    <div className="ledger-reveal mb-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-4">
                        <p className="editorial-label w-full">Drop here to change status</p>
                        {STATUS_TABS.filter(({ status }) => status !== activeTab).map(({ status, icon }) => (
                            <DropZone key={status} status={status} icon={icon} label={STATUS_CONFIG[status].label} />
                        ))}
                    </div>
                )}

                {/* Applications Grid */}
                {viewMode === 'stage' ? (
                    <DroppableArea
                        status={activeTab}
                        applications={activeApplications}
                        onCardClick={handleCardClick}
                        onAddClick={() => setIsAddModalOpen(true)}
                        visibleCount={visibleCounts[activeTab]}
                        onLoadMore={() => loadMore(activeTab)}
                    />
                ) : (
                    <div className="ledger-reveal space-y-7 pb-4">
                        <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Pipeline stage summary">
                            {columnsByStatus.map(({ status, icon, applications: statusApplications }) => (
                                <StageSummaryTile
                                    key={status}
                                    status={status}
                                    icon={icon}
                                    count={statusApplications.length}
                                    onAddClick={() => {
                                        setActiveTab(status);
                                        setIsAddModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>

                        {populatedColumns.length === 0 ? (
                            <div className="flex min-h-[260px] flex-col items-start justify-center border-y border-border py-12 text-left sm:items-center sm:text-center">
                                <p className="editorial-label mb-2">Empty pipeline</p>
                                <h2 className="mb-2 font-serif text-3xl font-semibold text-foreground">No entries yet</h2>
                                <p className="mb-5 max-w-sm text-sm text-muted-foreground">
                                    Applications you add will appear in their stage lanes.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Application
                                </Button>
                            </div>
                        ) : (
                            <div className={populatedColumns.length === 1
                                ? 'grid min-w-0 grid-cols-1 gap-5'
                                : 'grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3'}
                            >
                                {populatedColumns.map(({ status, applications: statusApplications }) => (
                                    <BoardColumn
                                        key={status}
                                        status={status}
                                        applications={statusApplications}
                                        onCardClick={handleCardClick}
                                        onAddClick={() => {
                                            setActiveTab(status);
                                            setIsAddModalOpen(true);
                                        }}
                                        visibleCount={visibleCounts[status]}
                                        onLoadMore={() => loadMore(status)}
                                        cardDensity={populatedColumns.length === 1 ? 'comfortable' : 'compact'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeApplication ? (
                        <div className="pointer-events-none opacity-95">
                            <JobCard application={activeApplication} density={viewMode === 'columns' ? 'compact' : 'comfortable'} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Bulk Action Bar */}
            <BulkActionBar />

            {lastUndo && (
                <div className="fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 border border-border bg-card px-4 py-3 shadow-none">
                    <span className="text-sm text-muted-foreground">{lastUndo.label}</span>
                    <Button variant="outline" size="sm" onClick={undoLastAction} className="gap-2">
                        <Undo2 className="h-4 w-4" />
                        Undo
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={clearUndo} aria-label="Dismiss undo">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

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
