'use client';

import { useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application } from '@/types';
import { useApplicationStore } from '@/store/applicationStore';
import { getCompanyDomain } from '@/constants/companies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TagBadge } from '@/components/ui/tag-badge';
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
    selectionMode?: boolean;
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

// Use Google's favicon service with accurate company domain
const getLogoUrl = (companyName: string): string => {
    const domain = getCompanyDomain(companyName);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        case 'LOW': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        default: return 'bg-muted text-muted-foreground';
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

export function JobCard({ application, onClick, selectionMode = false }: JobCardProps) {
    const [logoError, setLogoError] = useState(false);
    const { selectedIds, toggleSelection, isSelected } = useApplicationStore();
    const isCardSelected = isSelected(application.id);

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
    const logoUrl = getLogoUrl(application.companyName);

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
            className={`
        group cursor-pointer glass-card hover-glow overflow-hidden relative
        transition-all duration-200 ease-out mb-3
        ${isDragging ? 'opacity-80 shadow-xl scale-[1.02] rotate-1 z-50 ring-2 ring-primary/50' : ''}
        ${stalled ? 'border-l-4 border-l-amber-500/50' : ''}
        ${isCardSelected ? 'ring-2 ring-primary border-primary/50 bg-primary/5' : ''}
      `}
            {...attributes}
            {...listeners}
        >
            <CardContent className="p-4 relative">
                {/* Selection checkbox */}
                <button
                    onClick={handleCheckboxClick}
                    className={`
                        absolute top-3 left-3 w-5 h-5 rounded-md border-2 
                        flex items-center justify-center transition-all z-10
                        ${isCardSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border/60 bg-background/50 opacity-0 group-hover:opacity-100 hover:border-primary/50'
                        }
                        ${selectedIds.length > 0 ? 'opacity-100' : ''}
                    `}
                >
                    {isCardSelected && <Check className="h-3 w-3" />}
                </button>

                {/* Header */}
                <div className={`flex items-start gap-3 mb-3 ${selectedIds.length > 0 || isCardSelected ? 'pl-7' : ''}`}>
                    {/* Company Logo */}
                    <div className="relative flex-shrink-0">
                        <div className="relative w-10 h-10 rounded-lg bg-background flex items-center justify-center p-1.5 border border-border/40">
                            {!logoError ? (
                                <img
                                    src={logoUrl}
                                    alt={`${application.companyName} logo`}
                                    className="w-full h-full object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <span className="text-lg font-bold text-primary">
                                    {application.companyName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-semibold text-sm truncate pr-4 text-foreground group-hover:text-primary transition-colors duration-200">
                            {application.companyName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-xs text-muted-foreground truncate">
                                {application.jobTitle}
                            </p>
                            {application.jobUrl && (
                                <a
                                    href={application.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    <GripVertical className="h-4 w-4 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3" />
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-secondary text-secondary-foreground font-normal">
                        {getJobTypeLabel(application.jobType)}
                    </Badge>

                    {application.remotePolicy && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border/60">
                            {application.remotePolicy}
                        </Badge>
                    )}

                    <Badge className={`text-[10px] h-5 px-1.5 border hover:bg-transparent shadow-none ${getPriorityColor(application.priority)}`}>
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

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-border/40">
                    {salaryDisplay && (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 dark:text-emerald-400">
                            <IndianRupee className="h-3 w-3 flex-shrink-0" />
                            <span>{salaryDisplay.replace('₹', '')}</span> {/* Remove manual symbol if relying on icon */}
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground ml-auto">
                        <Calendar className="h-3 w-3 opacity-70" />
                        <span>{formatDate(application.appliedDate || application.updatedAt)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
