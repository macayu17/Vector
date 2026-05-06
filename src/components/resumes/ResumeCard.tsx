'use client';

import { useState } from 'react';
import { Resume } from '@/types';
import { useResumeStore } from '@/store/resumeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    FileText,
    Star,
    MoreVertical,
    ExternalLink,
    Trash2,
    Edit,
    Check
} from 'lucide-react';

interface ResumeCardProps {
    resume: Resume;
    onEdit: (resume: Resume) => void;
    index?: number;
}

const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export function ResumeCard({ resume, onEdit, index = 0 }: ResumeCardProps) {
    const { setDefaultResume, deleteResume } = useResumeStore();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSetDefault = async () => {
        await setDefaultResume(resume.id);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this resume?')) {
            setIsDeleting(true);
            await deleteResume(resume.id);
        }
    };

    return (
        <Card className={`
            ledger-reveal min-w-0 hover-glow transition-colors duration-200
            ${resume.isDefault ? 'border-primary/70 bg-secondary/30' : ''}
        `}
            style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
        >
            <CardContent className="p-4 sm:p-5">
                <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)_2rem] items-start gap-3">
                    {/* Icon */}
                    <div className={`
                        flex h-12 w-12 items-center justify-center border
                        ${resume.isDefault
                            ? 'border-primary text-primary'
                            : 'border-border bg-muted text-muted-foreground'
                        }
                    `}>
                        <FileText className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="min-w-0">
                            <div className="min-w-0">
                                <h3 className="text-wrap-safe line-clamp-3 font-serif text-[clamp(1.05rem,2vw,1.25rem)] font-semibold leading-snug">
                                    {resume.name}
                                </h3>
                                {resume.isDefault && (
                                    <Badge variant="secondary" className="mt-2 h-auto max-w-full gap-1 text-[10px]">
                                        <Star className="h-3 w-3 fill-current" />
                                        Default
                                    </Badge>
                                )}
                                {resume.version && (
                                    <p className="text-wrap-safe mt-1 text-xs text-muted-foreground">
                                        Version: {resume.version}
                                    </p>
                                )}
                            </div>
                        </div>

                        {resume.notes && (
                            <p className="text-wrap-safe mt-2 line-clamp-2 text-xs text-muted-foreground">
                                {resume.notes}
                            </p>
                        )}

                        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3">
                            <span className="text-wrap-safe text-[10px] text-muted-foreground">
                                Added {formatDate(resume.createdAt)}
                            </span>
                            {resume.fileUrl && (
                                <a
                                    href={resume.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    View
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="justify-self-end p-0"
                                aria-label={`Open actions for ${resume.name}`}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {resume.fileUrl && (
                                <DropdownMenuItem asChild>
                                    <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open Link
                                    </a>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(resume)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            {!resume.isDefault && (
                                <DropdownMenuItem onClick={handleSetDefault}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Set as Default
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive focus:text-destructive"
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}
