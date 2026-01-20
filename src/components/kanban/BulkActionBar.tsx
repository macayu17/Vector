'use client';

import { useState } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { APPLICATION_STATUSES, STATUS_CONFIG, ApplicationStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckSquare, Trash2, ArrowRight, X } from 'lucide-react';

export function BulkActionBar() {
    const { selectedIds, clearSelection, bulkUpdateStatus, bulkDelete } = useApplicationStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleStatusChange = async (status: ApplicationStatus) => {
        await bulkUpdateStatus(selectedIds, status);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await bulkDelete(selectedIds);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card border border-border/50 shadow-2xl">
                    {/* Selection count */}
                    <div className="flex items-center gap-2 pr-3 border-r border-border/50">
                        <CheckSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                            {selectedIds.length} selected
                        </span>
                    </div>

                    {/* Move to status */}
                    <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Select onValueChange={(value) => handleStatusChange(value as ApplicationStatus)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs bg-background/50">
                                <SelectValue placeholder="Move to..." />
                            </SelectTrigger>
                            <SelectContent>
                                {APPLICATION_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status} className="text-xs">
                                        {STATUS_CONFIG[status].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Delete button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>

                    {/* Clear selection */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={clearSelection}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete {selectedIds.length} applications?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. These applications will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
