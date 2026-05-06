'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APPLICATION_STATUSES, PRIORITY_LEVELS, STATUS_CONFIG, ApplicationStatus, Priority } from '@/types';
import { useApplicationStore } from '@/store/applicationStore';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { Calendar, FileText, LayoutDashboard, Plus, Search, Settings, SlidersHorizontal } from 'lucide-react';

export function AppCommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const {
        selectedIds,
        savedViews,
        applications,
        bulkUpdateStatus,
        bulkUpdatePriority,
        applySavedView,
        clearFilters,
        setFilters,
        getDueFollowUps,
    } = useApplicationStore();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setOpen((current) => !current);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const run = (callback: () => void) => {
        setOpen(false);
        callback();
    };

    const dispatchDashboardEvent = (eventName: string, detail?: Record<string, string>) => {
        router.push('/dashboard');
        window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        }, 80);
    };

    const selectedApplication = selectedIds.length === 1
        ? applications.find((application) => application.id === selectedIds[0])
        : undefined;
    const dueCount = getDueFollowUps().length;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search actions, views, and navigation..." />
            <CommandList>
                <CommandEmpty>No command found.</CommandEmpty>

                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => run(() => dispatchDashboardEvent('careerflow-open-add-application'))}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add application
                        <CommandShortcut>N</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => run(() => dispatchDashboardEvent('careerflow-show-due-followups'))}>
                        <Search className="mr-2 h-4 w-4" />
                        Show due follow-ups
                        <CommandShortcut>{dueCount}</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => run(() => {
                            if (selectedApplication) {
                                dispatchDashboardEvent('careerflow-open-application-detail', { id: selectedApplication.id });
                            } else {
                                router.push('/resumes');
                            }
                        })}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Attach or review resume
                        <CommandShortcut>{selectedIds.length === 1 ? 'selected' : 'resumes'}</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                {selectedIds.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading={`${selectedIds.length} selected`}>
                            {APPLICATION_STATUSES.map((status) => (
                                <CommandItem
                                    key={status}
                                    onSelect={() => run(() => bulkUpdateStatus(selectedIds, status as ApplicationStatus))}
                                >
                                    Move to {STATUS_CONFIG[status].label}
                                </CommandItem>
                            ))}
                            {PRIORITY_LEVELS.map((priority) => (
                                <CommandItem
                                    key={priority}
                                    onSelect={() => run(() => bulkUpdatePriority(selectedIds, priority as Priority))}
                                >
                                    Set priority {priority.toLowerCase()}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />
                <CommandGroup heading="Views">
                    <CommandItem onSelect={() => run(() => setFilters({ priorities: ['HIGH'] }))}>
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        High priority applications
                    </CommandItem>
                    <CommandItem onSelect={() => run(() => setFilters({ jobTypes: ['INTERNSHIP'] }))}>
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Internships
                    </CommandItem>
                    <CommandItem onSelect={() => run(clearFilters)}>
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Clear filters
                    </CommandItem>
                    {savedViews.map((view) => (
                        <CommandItem
                            key={view.id}
                            onSelect={() => run(() => {
                                applySavedView(view.id);
                                router.push('/dashboard');
                            })}
                        >
                            Saved view: {view.name}
                            <CommandShortcut>{STATUS_CONFIG[view.activeStatus].label}</CommandShortcut>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Navigate">
                    <CommandItem onSelect={() => run(() => router.push('/dashboard'))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Ledger
                    </CommandItem>
                    <CommandItem onSelect={() => run(() => router.push('/calendar'))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar
                    </CommandItem>
                    <CommandItem onSelect={() => run(() => router.push('/resumes'))}>
                        <FileText className="mr-2 h-4 w-4" />
                        Resumes
                    </CommandItem>
                    <CommandItem onSelect={() => run(() => router.push('/settings'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
