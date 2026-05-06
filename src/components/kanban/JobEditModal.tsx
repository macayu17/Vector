'use client';

import { useState, useEffect } from 'react';
import { Application, Tag } from '@/types';
import { useApplicationStore } from '@/store/applicationStore';
import { useResumeStore } from '@/store/resumeStore';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building,
    Trash2,
    MapPin,
    Globe,
    FileText,
    X,
    CalendarPlus,
    CheckCircle2,
    RotateCcw,
    Clock3,
} from 'lucide-react';
import { TagSelector } from './TagSelector';
import { CompanyLogo } from './CompanyLogo';

interface JobEditModalProps {
    application: Application | null;
    open: boolean;
    onClose: () => void;
}

export function JobEditModal({ application, open, onClose }: JobEditModalProps) {
    const {
        updateApplication,
        deleteApplication,
        followUps,
        activityLog,
        setFollowUp,
        completeFollowUp,
        snoozeFollowUp,
        clearFollowUp,
    } = useApplicationStore();
    const { resumes, fetchResumes } = useResumeStore();
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState<Partial<Application>>({});
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpNote, setFollowUpNote] = useState('');

    const followUp = application ? followUps[application.id] : undefined;
    const applicationActivity = application
        ? activityLog.filter((entry) => entry.applicationId === application.id).slice(0, 12)
        : [];

    useEffect(() => {
        if (open) {
            fetchResumes();
        }
    }, [open, fetchResumes]);

    useEffect(() => {
        if (application) {
            const frame = requestAnimationFrame(() => {
                setFormData({ ...application });
                setSelectedTags(application.tags || []);
                const existingFollowUp = followUps[application.id];
                setFollowUpDate(existingFollowUp?.dueDate || '');
                setFollowUpNote(existingFollowUp?.note || '');
            });

            return () => cancelAnimationFrame(frame);
        }
    }, [application, followUps]);

    const updateField = (field: keyof Application, value: Application[keyof Application]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (application && formData) {
            updateApplication(application.id, { ...formData, tags: selectedTags });
            onClose();
        }
    };

    const handleDelete = () => {
        if (confirmDelete && application) {
            deleteApplication(application.id);
            onClose();
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    const handleFollowUpSave = () => {
        if (!application || !followUpDate) return;
        setFollowUp(application.id, followUpDate, followUpNote || undefined);
    };

    const formatActivityDate = (value: string) =>
        new Date(value).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

    if (!application) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="bottom-0 left-0 top-auto h-[92vh] max-h-[92vh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-t-md border-x-0 border-b-0 p-0 sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:h-screen sm:max-h-screen sm:w-[480px] sm:max-w-[480px] sm:translate-x-0 sm:translate-y-0 sm:rounded-none sm:border-y-0 sm:border-r-0"
            >
                <DialogTitle className="sr-only">
                    Edit {application.jobTitle} at {application.companyName}
                </DialogTitle>
                <div className="relative border-b border-border bg-secondary/40 px-8 py-6">
                    <div className="flex items-center gap-4">
                        <CompanyLogo companyName={application.companyName} size="lg" />
                        <div>
                            <p className="editorial-label mb-1">Application record</p>
                            <h2 className="font-serif text-2xl font-semibold">{application.companyName}</h2>
                            <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="px-8 py-8 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-start gap-4 mb-6">
                        <div>
                            <h2 className="text-wrap-safe text-2xl font-semibold">
                                {formData.jobTitle}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {formData.companyName}
                            </p>
                            {followUp && !followUp.completed && (
                                <p className="editorial-label mt-3 text-primary">
                                    Follow-up {new Date(followUp.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={confirmDelete ? "destructive" : "outline"}
                                onClick={handleDelete}
                                className="gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {confirmDelete ? "Confirm?" : "Delete"}
                            </Button>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-4 mb-6">
                            <TabsTrigger value="details" className="mb-0 text-[10px]">Details</TabsTrigger>
                            <TabsTrigger value="tracking" className="mb-0 text-[10px]">Track</TabsTrigger>
                            <TabsTrigger value="followup" className="mb-0 text-[10px]">Follow</TabsTrigger>
                            <TabsTrigger value="activity" className="mb-0 text-[10px]">Activity</TabsTrigger>
                        </TabsList>

                        <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            <TabsContent value="details" className="space-y-4 mt-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            value={formData.jobTitle}
                                            onChange={(e) => updateField('jobTitle', e.target.value)}
                                            className="bg-background/40"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <Label>Company</Label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.companyName}
                                                onChange={(e) => updateField('companyName', e.target.value)}
                                                className="pl-9 bg-background/40"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.location}
                                                onChange={(e) => updateField('location', e.target.value)}
                                                className="pl-9 bg-background/40"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Job Type</Label>
                                        <Select
                                            value={formData.jobType || 'FULL_TIME'}
                                            onValueChange={(value) => updateField('jobType', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                                                <SelectItem value="PART_TIME">Part-time</SelectItem>
                                                <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                                <SelectItem value="CONTRACT">Contract</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Remote Policy</Label>
                                        <Select
                                            value={formData.remotePolicy}
                                            onValueChange={(value) => updateField('remotePolicy', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="On-site">On-site</SelectItem>
                                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                <SelectItem value="Remote">Remote</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Salary Range</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">Min</span>
                                                <Input
                                                    type="number"
                                                    value={formData.salaryMin || ''}
                                                    onChange={(e) => updateField('salaryMin', parseInt(e.target.value))}
                                                    className="pl-8 bg-background/40"
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">Max</span>
                                                <Input
                                                    type="number"
                                                    value={formData.salaryMax || ''}
                                                    onChange={(e) => updateField('salaryMax', parseInt(e.target.value))}
                                                    className="pl-8 bg-background/40"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Job URL</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.jobUrl}
                                            onChange={(e) => updateField('jobUrl', e.target.value)}
                                            className="pl-9 bg-background/40 text-primary underline-offset-4 hover:underline cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="tracking" className="space-y-4 mt-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => updateField('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="APPLIED">Applied</SelectItem>
                                                <SelectItem value="OA_RECEIVED">OA Received</SelectItem>
                                                <SelectItem value="INTERVIEW_SCHEDULED">Interview</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                                <SelectItem value="STALLED">Stalled</SelectItem>
                                                <SelectItem value="WISHLIST">Wishlist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value) => updateField('priority', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="LOW">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Resume Selector */}
                                {resumes.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Resume Used
                                        </Label>
                                        <Select
                                            value={formData.resumeId || 'none'}
                                            onValueChange={(value) => updateField('resumeId', value === 'none' ? undefined : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select resume..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {resumes.map((resume) => (
                                                    <SelectItem key={resume.id} value={resume.id}>
                                                        {resume.name}
                                                        {resume.isDefault && ' (Default)'}
                                                        {resume.version && ` - ${resume.version}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Tags */}
                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <TagSelector
                                        selectedTags={selectedTags}
                                        onTagsChange={setSelectedTags}
                                        applicationId={application.id}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={formData.notes || ''}
                                        onChange={(e) => updateField('notes', e.target.value)}
                                        className="min-h-[150px] bg-background/40 font-mono text-sm"
                                        placeholder="Interview notes, copy of job description, thoughts..."
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="followup" className="space-y-5 mt-0">
                                <div className="border-y border-border py-4">
                                    <p className="editorial-label mb-2">Reminder</p>
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label>Follow-up date</Label>
                                            <Input
                                                type="date"
                                                value={followUpDate}
                                                onChange={(event) => setFollowUpDate(event.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Follow-up note</Label>
                                            <Textarea
                                                value={followUpNote}
                                                onChange={(event) => setFollowUpNote(event.target.value)}
                                                className="min-h-24"
                                                placeholder="Recruiter note, next action, or message draft..."
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button size="sm" onClick={handleFollowUpSave} className="gap-2">
                                            <CalendarPlus className="h-4 w-4" />
                                            Save Reminder
                                        </Button>
                                        {followUp && (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => snoozeFollowUp(application.id, 3)} className="gap-2">
                                                    <RotateCcw className="h-4 w-4" />
                                                    Snooze 3d
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => completeFollowUp(application.id)} className="gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Done
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => clearFollowUp(application.id)}>
                                                    Clear
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="activity" className="mt-0">
                                {applicationActivity.length === 0 ? (
                                    <div className="border-y border-border py-8 text-sm text-muted-foreground">
                                        No activity captured yet.
                                    </div>
                                ) : (
                                    <div className="border-y border-border">
                                        {applicationActivity.map((entry) => (
                                            <div key={entry.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 border-b border-border py-3 last:border-b-0">
                                                <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium">{entry.label}</p>
                                                    {entry.detail && (
                                                        <p className="text-xs text-muted-foreground">{entry.detail}</p>
                                                    )}
                                                    <p className="editorial-label mt-1 text-[9px]">{formatActivityDate(entry.createdAt)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>

                    <Button onClick={handleSave} className="w-full mt-6">
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
