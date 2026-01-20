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
}

const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export function ResumeCard({ resume, onEdit }: ResumeCardProps) {
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
            glass-card hover-glow transition-all duration-300
            ${resume.isDefault ? 'ring-2 ring-primary/50 border-primary/30' : ''}
        `}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${resume.isDefault
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }
                    `}>
                        <FileText className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    {resume.name}
                                    {resume.isDefault && (
                                        <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                                            <Star className="h-3 w-3 fill-current" />
                                            Default
                                        </Badge>
                                    )}
                                </h3>
                                {resume.version && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Version: {resume.version}
                                    </p>
                                )}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

                        {resume.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {resume.notes}
                            </p>
                        )}

                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
                            <span className="text-[10px] text-muted-foreground">
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
                </div>
            </CardContent>
        </Card>
    );
}
