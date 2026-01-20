'use client';

import { useState, useEffect } from 'react';
import { Application, Tag } from '@/types';
import { useApplicationStore } from '@/store/applicationStore';
import { useResumeStore } from '@/store/resumeStore';
import { getCompanyDomain } from '@/constants/companies';
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
    X
} from 'lucide-react';
import { TagSelector } from './TagSelector';

interface JobEditModalProps {
    application: Application | null;
    open: boolean;
    onClose: () => void;
}

export function JobEditModal({ application, open, onClose }: JobEditModalProps) {
    const { updateApplication, deleteApplication } = useApplicationStore();
    const { resumes, fetchResumes } = useResumeStore();
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState<Partial<Application>>({});
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        if (open) {
            fetchResumes();
        }
    }, [open, fetchResumes]);

    useEffect(() => {
        if (application) {
            setFormData({ ...application });
            setSelectedTags(application.tags || []);
            setLogoError(false);
        }
    }, [application]);

    const updateField = (field: keyof Application, value: any) => {
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

    if (!application) return null;

    const logoUrl = `https://www.google.com/s2/favicons?domain=${getCompanyDomain(application.companyName)}&sz=128`;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="max-w-2xl max-h-[85vh] p-0 gap-0 glass-card overflow-hidden">
                {/* Hidden title for accessibility */}
                <DialogTitle className="sr-only">
                    Edit {application.jobTitle} at {application.companyName}
                </DialogTitle>
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-r from-primary to-indigo-800 relative">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-20 h-20 bg-background rounded-2xl shadow-xl flex items-center justify-center border-4 border-background overflow-hidden p-2">
                            {!logoError ? (
                                <img
                                    src={logoUrl}
                                    alt={`${application.companyName} logo`}
                                    className="w-12 h-12 object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <span className="text-3xl font-bold text-primary">
                                    {application.companyName.charAt(0)}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/20"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="pt-12 px-8 pb-8 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                {formData.jobTitle}
                            </h2>
                            <p className="text-lg text-muted-foreground font-medium">
                                {formData.companyName}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={confirmDelete ? "destructive" : "outline"}
                                onClick={handleDelete}
                                className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                {confirmDelete ? "Confirm?" : "Delete"}
                            </Button>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-2 mb-6 bg-secondary/50 p-1">
                            <TabsTrigger value="details" className="data-[state=active]:bg-background data-[state=active]:text-primary mb-0 shadow-none">Job Details</TabsTrigger>
                            <TabsTrigger value="tracking" className="data-[state=active]:bg-background data-[state=active]:text-primary mb-0 shadow-none">Tracking Info</TabsTrigger>
                        </TabsList>

                        <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            <TabsContent value="details" className="space-y-4 mt-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            value={formData.jobTitle}
                                            onChange={(e) => updateField('jobTitle', e.target.value)}
                                            className="bg-background/50 border-primary/10 focus:border-primary/50"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <Label>Company</Label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.companyName}
                                                onChange={(e) => updateField('companyName', e.target.value)}
                                                className="pl-9 bg-background/50 border-primary/10 focus:border-primary/50"
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
                                                className="pl-9 bg-background/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Job Type</Label>
                                        <Select
                                            value={formData.jobType || 'FULL_TIME'}
                                            onValueChange={(value) => updateField('jobType', value)}
                                        >
                                            <SelectTrigger className="bg-background/50">
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
                                            <SelectTrigger className="bg-background/50">
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
                                                    className="pl-8 bg-background/50"
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">Max</span>
                                                <Input
                                                    type="number"
                                                    value={formData.salaryMax || ''}
                                                    onChange={(e) => updateField('salaryMax', parseInt(e.target.value))}
                                                    className="pl-8 bg-background/50"
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
                                            className="pl-9 bg-background/50 text-blue-500 underline-offset-4 hover:underline cursor-pointer"
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
                                            <SelectTrigger className="bg-background/50">
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
                                            <SelectTrigger className="bg-background/50">
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
                                            value={formData.resumeId || ''}
                                            onValueChange={(value) => updateField('resumeId', value || undefined)}
                                        >
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Select resume..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">None</SelectItem>
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
                                        className="min-h-[150px] bg-background/50 font-mono text-sm"
                                        placeholder="Interview notes, copy of job description, thoughts..."
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <Button onClick={handleSave} className="w-full mt-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
