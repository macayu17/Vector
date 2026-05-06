'use client';

import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application } from '@/types';
import { useApplicationStore } from '@/store/applicationStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TagBadge } from '@/components/ui/tag-badge';
import { CompanyLogo } from './CompanyLogo';
import {
    Calendar,
    IndianRupee,
    ExternalLink,
    GripVertical,
    Check
} from 'lucide-react';

interface JobCardProps {
    application: Application;
    onClick?: () => void;
    density?: 'comfortable' | 'compact';
}

const isStalled = (updatedAt: Date): boolean => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return new Date(updatedAt) < fourteenDaysAgo;
};

const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

const formatSalary = (min?: number | null, max?: number | null): string => {
    if (!min && !max) return '';

    // Explicitly force INR formatting
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'decimal', // Use decimal style to avoid default symbol issues
        maximumFractionDigits: 0,
        notation: 'compact',
    });

    const minStr = min ? `₹${formatter.format(min)}` : '';
    const maxStr = max ? `₹${formatter.format(max)}` : '';

    if (min && max) return `${minStr} - ${maxStr}`;
    if (min) return `${minStr}+`;
    if (max) return `Up to ${maxStr}`;
    return '';
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'HIGH': return 'bg-transparent text-[#c14f3c] border-[#c14f3c]/60';
        case 'MEDIUM': return 'bg-transparent text-primary border-primary/60';
        case 'LOW': return 'bg-transparent text-[#a99f91] border-border';
        default: return 'bg-transparent text-muted-foreground border-border';
    }
};

const getPriorityTextColor = (priority: string) => {
    switch (priority) {
        case 'HIGH': return 'text-[#c14f3c]';
        case 'MEDIUM': return 'text-primary';
        case 'LOW': return 'text-[#a99f91]';
        default: return 'text-muted-foreground';
    }
};

const getJobTypeLabel = (type: string) => {
    switch (type) {
        case 'FULL_TIME': return 'Full-time';
        case 'PART_TIME': return 'Part-time';
        case 'INTERNSHIP': return 'Internship';
        case 'CONTRACT': return 'Contract';
        default: return type;
    }
};

export function JobCard({ application, onClick, density = 'comfortable' }: JobCardProps) {
    const { selectedIds, toggleSelection, isSelected } = useApplicationStore();
    const isCardSelected = isSelected(application.id);
    const isCompact = density === 'compact';

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const stalled = isStalled(application.updatedAt);
    const salaryDisplay = formatSalary(application.salaryMin, application.salaryMax);

    const handleClick = useCallback((e: React.MouseEvent) => {
        // If shift key is held or we're in selection mode, toggle selection
        if (e.shiftKey || selectedIds.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            toggleSelection(application.id);
        } else if (onClick) {
            onClick();
        }
    }, [onClick, selectedIds.length, toggleSelection, application.id]);

    const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSelection(application.id);
    }, [toggleSelection, application.id]);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            onClick={handleClick}
            aria-label={`${application.companyName}, ${application.jobTitle}, ${application.status.replaceAll('_', ' ').toLowerCase()}`}
            className={`
        group relative mb-0 cursor-pointer overflow-visible rounded-none border-x-0 border-b border-t-0 bg-transparent py-0
        transition-colors duration-200 ease-out hover:bg-secondary/10
        ${isDragging ? 'z-50 bg-secondary/30 opacity-90' : ''}
        ${stalled ? 'border-l-2 border-l-[#d69f57] pl-4' : ''}
        ${isCardSelected ? 'bg-secondary/30' : ''}
      `}
            {...attributes}
            {...listeners}
        >
            <CardContent className={`relative p-0 ${isCompact ? 'py-3' : 'py-3.5 sm:py-5'}`}>
                {/* Selection checkbox */}
                <button
                    type="button"
                    onClick={handleCheckboxClick}
                    aria-label={isCardSelected ? `Deselect ${application.companyName}` : `Select ${application.companyName}`}
                    className={`
                        absolute z-10 flex h-5 w-5 items-center justify-center border
                        flex items-center justify-center transition-all z-10
                        ${isCompact ? 'right-0 top-3' : 'left-0 top-4 sm:top-5'}
                        ${isCardSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border bg-background opacity-0 group-hover:opacity-100 hover:border-primary'
                        }
                        ${selectedIds.length > 0 ? 'opacity-100' : ''}
                    `}
                >
                    {isCardSelected && <Check className="h-3 w-3" />}
                </button>

                {isCompact ? (
                    <div className={`min-w-0 ${selectedIds.length > 0 || isCardSelected ? 'pr-7' : ''}`}>
                        <div className="flex min-w-0 items-start gap-2.5">
                            <CompanyLogo companyName={application.companyName} size="sm" />
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate font-serif text-base font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary">
                                    {application.companyName}
                                </h3>
                                <p className="text-wrap-safe mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                    {application.jobTitle}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
                            <Badge variant="secondary" className="h-5 min-w-0 px-1.5 text-[9px]">
                                <span className="truncate">{getJobTypeLabel(application.jobType)}</span>
                            </Badge>
                            <span className={`editorial-label shrink-0 text-[9px] ${getPriorityTextColor(application.priority)}`}>
                                {application.priority.toLowerCase()}
                            </span>
                        </div>

                        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3 opacity-70" />
                            <span>{formatDate(application.appliedDate || application.updatedAt)}</span>
                        </div>
                    </div>
                ) : (
                    <>
                {/* Header */}
                <div className={`grid grid-cols-[2.5rem_minmax(0,1fr)_4.25rem] items-start gap-3 pr-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-4 sm:pr-8 ${selectedIds.length > 0 || isCardSelected ? 'pl-8' : ''}`}>
                    <div className="relative flex-shrink-0">
                        <CompanyLogo companyName={application.companyName} size="sm" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate font-serif text-lg font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary sm:text-[clamp(1.25rem,2.4vw,1.5rem)]">
                            {application.companyName}
                        </h3>
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 sm:gap-2">
                            <p className="truncate text-xs leading-normal text-muted-foreground sm:text-sm">
                                {application.jobTitle}
                            </p>
                            {application.jobUrl && (
                                <a
                                    href={application.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Open job posting for ${application.companyName}`}
                                    className="text-muted-foreground opacity-0 transition-all hover:text-primary group-hover:opacity-100"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-col items-end gap-1 text-right">
                        {salaryDisplay && (
                            <div className="hidden items-center gap-1 text-sm font-medium text-[#7f8f69] sm:flex">
                                <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{salaryDisplay.replace('₹', '')}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5 sm:text-xs">
                            <Calendar className="h-3 w-3 opacity-70 sm:h-3.5 sm:w-3.5" />
                            <span>{formatDate(application.appliedDate || application.updatedAt)}</span>
                        </div>

                        <span className={`editorial-label max-w-full truncate text-[9px] sm:hidden ${getPriorityTextColor(application.priority)}`}>
                            {application.priority.toLowerCase()}
                        </span>
                    </div>

                    <GripVertical className="absolute right-0 top-6 hidden h-4 w-4 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
                </div>

                <div className={`mt-3 hidden flex-wrap gap-1.5 sm:flex ${selectedIds.length > 0 || isCardSelected ? 'pl-8' : ''} sm:ml-14`}>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {getJobTypeLabel(application.jobType)}
                    </Badge>

                    {application.remotePolicy && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                            {application.remotePolicy}
                        </Badge>
                    )}

                    <Badge className={`h-5 px-1.5 text-[10px] shadow-none ${getPriorityColor(application.priority)}`}>
                        {application.priority.toLowerCase()}
                    </Badge>

                    {/* Application tags */}
                    {application.tags?.slice(0, 2).map((tag) => (
                        <TagBadge
                            key={tag.id}
                            name={tag.name}
                            color={tag.color}
                            size="sm"
                        />
                    ))}
                    {(application.tags?.length ?? 0) > 2 && (
                        <span className="text-[10px] text-muted-foreground px-1">
                            +{(application.tags?.length ?? 0) - 2}
                        </span>
                    )}
                </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
