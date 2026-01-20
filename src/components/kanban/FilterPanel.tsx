'use client';

import { useState } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { useTagStore } from '@/store/tagStore';
import { APPLICATION_STATUSES, PRIORITY_LEVELS, STATUS_CONFIG, ApplicationStatus, Priority, JobType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X, ChevronDown } from 'lucide-react';

const JOB_TYPES: { value: JobType; label: string }[] = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'CONTRACT', label: 'Contract' },
];

export function FilterPanel() {
    const { filters, setFilters, clearFilters } = useApplicationStore();
    const { tags } = useTagStore();
    const [isOpen, setIsOpen] = useState(false);

    const activeFilterCount =
        filters.statuses.length +
        filters.priorities.length +
        filters.jobTypes.length +
        filters.tags.length +
        (filters.location ? 1 : 0) +
        (filters.salaryMin !== undefined ? 1 : 0) +
        (filters.salaryMax !== undefined ? 1 : 0);

    const toggleStatus = (status: ApplicationStatus) => {
        const newStatuses = filters.statuses.includes(status)
            ? filters.statuses.filter(s => s !== status)
            : [...filters.statuses, status];
        setFilters({ statuses: newStatuses });
    };

    const togglePriority = (priority: Priority) => {
        const newPriorities = filters.priorities.includes(priority)
            ? filters.priorities.filter(p => p !== priority)
            : [...filters.priorities, priority];
        setFilters({ priorities: newPriorities });
    };

    const toggleJobType = (jobType: JobType) => {
        const newJobTypes = filters.jobTypes.includes(jobType)
            ? filters.jobTypes.filter(j => j !== jobType)
            : [...filters.jobTypes, jobType];
        setFilters({ jobTypes: newJobTypes });
    };

    const toggleTag = (tagId: string) => {
        const newTags = filters.tags.includes(tagId)
            ? filters.tags.filter(t => t !== tagId)
            : [...filters.tags, tagId];
        setFilters({ tags: newTags });
    };

    return (
        <div className="flex items-center gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-background/50 border-border/60"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                {activeFilterCount}
                            </Badge>
                        )}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-4">
                        {/* Status Filter */}
                        <div>
                            <h4 className="text-sm font-medium mb-2">Status</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {APPLICATION_STATUSES.map((status) => (
                                    <Badge
                                        key={status}
                                        variant={filters.statuses.includes(status) ? 'default' : 'outline'}
                                        className="cursor-pointer text-xs"
                                        onClick={() => toggleStatus(status)}
                                    >
                                        {STATUS_CONFIG[status].label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <h4 className="text-sm font-medium mb-2">Priority</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {PRIORITY_LEVELS.map((priority) => (
                                    <Badge
                                        key={priority}
                                        variant={filters.priorities.includes(priority) ? 'default' : 'outline'}
                                        className="cursor-pointer text-xs capitalize"
                                        onClick={() => togglePriority(priority)}
                                    >
                                        {priority.toLowerCase()}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Job Type Filter */}
                        <div>
                            <h4 className="text-sm font-medium mb-2">Job Type</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {JOB_TYPES.map(({ value, label }) => (
                                    <Badge
                                        key={value}
                                        variant={filters.jobTypes.includes(value) ? 'default' : 'outline'}
                                        className="cursor-pointer text-xs"
                                        onClick={() => toggleJobType(value)}
                                    >
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Tags Filter */}
                        {tags.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant={filters.tags.includes(tag.id) ? 'default' : 'outline'}
                                            className="cursor-pointer text-xs"
                                            style={{
                                                backgroundColor: filters.tags.includes(tag.id) ? tag.color : 'transparent',
                                                borderColor: tag.color,
                                                color: filters.tags.includes(tag.id) ? 'white' : tag.color,
                                            }}
                                            onClick={() => toggleTag(tag.id)}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Clear All */}
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full gap-2 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    clearFilters();
                                    setIsOpen(false);
                                }}
                            >
                                <X className="h-4 w-4" />
                                Clear all filters
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {filters.statuses.map((status) => (
                        <Badge
                            key={status}
                            variant="secondary"
                            className="gap-1 text-xs cursor-pointer hover:bg-destructive/20"
                            onClick={() => toggleStatus(status)}
                        >
                            {STATUS_CONFIG[status].label}
                            <X className="h-3 w-3" />
                        </Badge>
                    ))}
                    {filters.priorities.map((priority) => (
                        <Badge
                            key={priority}
                            variant="secondary"
                            className="gap-1 text-xs cursor-pointer capitalize hover:bg-destructive/20"
                            onClick={() => togglePriority(priority)}
                        >
                            {priority.toLowerCase()}
                            <X className="h-3 w-3" />
                        </Badge>
                    ))}
                    {filters.tags.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                            <Badge
                                key={tagId}
                                variant="secondary"
                                className="gap-1 text-xs cursor-pointer hover:bg-destructive/20"
                                style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
                                onClick={() => toggleTag(tagId)}
                            >
                                {tag.name}
                                <X className="h-3 w-3" />
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
