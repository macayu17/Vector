'use client';

import { useState, useEffect } from 'react';
import { Resume } from '@/types';
import { useResumeStore } from '@/store/resumeStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ResumeModalProps {
    open: boolean;
    onClose: () => void;
    resume?: Resume | null; // If provided, edit mode
}

export function ResumeModal({ open, onClose, resume }: ResumeModalProps) {
    const { addResume, updateResume } = useResumeStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        fileUrl: '',
        version: '',
        notes: '',
        isDefault: false,
    });

    // Reset form when modal opens/closes or resume changes
    useEffect(() => {
        if (open && resume) {
            setFormData({
                name: resume.name,
                fileUrl: resume.fileUrl || '',
                version: resume.version || '',
                notes: resume.notes || '',
                isDefault: resume.isDefault,
            });
        } else if (open) {
            setFormData({
                name: '',
                fileUrl: '',
                version: '',
                notes: '',
                isDefault: false,
            });
        }
    }, [open, resume]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSubmitting(true);

        try {
            if (resume) {
                // Update existing
                await updateResume(resume.id, {
                    name: formData.name,
                    fileUrl: formData.fileUrl || undefined,
                    version: formData.version || undefined,
                    notes: formData.notes || undefined,
                });
            } else {
                // Create new
                await addResume({
                    userId: '', // Will be set by store
                    name: formData.name,
                    fileUrl: formData.fileUrl || undefined,
                    version: formData.version || undefined,
                    notes: formData.notes || undefined,
                    isDefault: formData.isDefault,
                });
            }
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md glass-card p-6 border-t-4 border-t-primary">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold">
                        {resume ? 'Edit Resume' : 'Add Resume'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name <span className="text-red-500">*</span></Label>
                        <Input
                            required
                            placeholder="e.g. Software Engineer Resume"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-background border-border/60"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>File URL</Label>
                        <Input
                            type="url"
                            placeholder="https://drive.google.com/file/..."
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                            className="bg-background border-border/60"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Link to your resume (Google Drive, Dropbox, etc.)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Version</Label>
                        <Input
                            placeholder="e.g. v2.1 or March 2024"
                            value={formData.version}
                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            className="bg-background border-border/60"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                            placeholder="Details about this resume version..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="bg-background border-border/60 min-h-[80px]"
                        />
                    </div>

                    {!resume && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="rounded border-border"
                            />
                            <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                                Set as default resume
                            </Label>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-border/40">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-primary text-white hover:bg-primary/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (resume ? 'Save Changes' : 'Add Resume')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
