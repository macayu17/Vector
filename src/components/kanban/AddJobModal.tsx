'use client';

import { useState, useEffect } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { useResumeStore } from '@/store/resumeStore';
import { useTagStore } from '@/store/tagStore';
import { Application, ApplicationStatus, JobType, Tag } from '@/types';
import { TOP_100_COMPANIES } from '@/constants/companies';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Building2, MapPin, FileText } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { TagSelector } from './TagSelector';

interface AddJobModalProps {
    open: boolean;
    onClose: () => void;
    defaultStatus?: ApplicationStatus;
}

export function AddJobModal({ open, onClose, defaultStatus = 'WISHLIST' }: AddJobModalProps) {
    const { addApplication } = useApplicationStore();
    const { resumes, fetchResumes } = useResumeStore();
    const { addTagToApplication } = useTagStore();

    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        jobUrl: '',
        location: '',
        remotePolicy: 'On-site',
        priority: 'MEDIUM',
        jobType: 'FULL_TIME' as JobType,
        salaryMin: '',
        salaryMax: '',
        resumeId: '',
    });
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [companyOpen, setCompanyOpen] = useState(false);

    // Fetch resumes on mount
    useEffect(() => {
        if (open) {
            fetchResumes();
        }
    }, [open, fetchResumes]);

    // Set default resume when resumes are loaded
    useEffect(() => {
        if (resumes.length > 0 && !formData.resumeId) {
            const defaultResume = resumes.find(r => r.isDefault);
            if (defaultResume) {
                setFormData(prev => ({ ...prev, resumeId: defaultResume.id }));
            }
        }
    }, [resumes, formData.resumeId]);

    const companyOptions = [...TOP_100_COMPANIES];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.companyName || !formData.jobTitle) return;

        const newApplication: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: '',
            companyName: formData.companyName,
            jobTitle: formData.jobTitle,
            jobUrl: formData.jobUrl || undefined,
            location: formData.location || undefined,
            remotePolicy: formData.remotePolicy,
            status: defaultStatus,
            priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH',
            jobType: formData.jobType,
            salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
            salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
            currency: 'INR',
            resumeId: formData.resumeId || undefined,
            tags: selectedTags,
        };

        await addApplication(newApplication);

        // Reset form
        setFormData({
            companyName: '',
            jobTitle: '',
            jobUrl: '',
            location: '',
            remotePolicy: 'On-site',
            priority: 'MEDIUM',
            jobType: 'FULL_TIME',
            salaryMin: '',
            salaryMax: '',
            resumeId: '',
        });
        setSelectedTags([]);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md glass-card p-6 border-t-4 border-t-primary max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold">
                        Add New Position
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Job Title <span className="text-red-500">*</span></Label>
                        <Input
                            required
                            placeholder="e.g. Senior Frontend Engineer"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            className="bg-background border-border/60"
                        />
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label>Company <span className="text-red-500">*</span></Label>
                        <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={companyOpen}
                                    className="justify-between bg-background border-border/60 font-normal hover:bg-background hover:text-foreground"
                                >
                                    {formData.companyName ? (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 opacity-50" />
                                            {formData.companyName}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Building2 className="h-4 w-4 opacity-50" />
                                            Select company...
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search company..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            <span className="text-sm text-muted-foreground">
                                                Type manually in the box below
                                            </span>
                                        </CommandEmpty>
                                        <CommandGroup heading="Suggestions">
                                            {companyOptions.map((company) => (
                                                <CommandItem
                                                    key={company}
                                                    value={company}
                                                    onSelect={(currentValue) => {
                                                        setFormData({ ...formData, companyName: currentValue });
                                                        setCompanyOpen(false);
                                                    }}
                                                >
                                                    {company}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <div className="relative mt-1">
                            <Input
                                placeholder="Or type company name manually..."
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="bg-background/50 border-border/60 text-sm h-8"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Select from list or type above</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.jobType}
                                onValueChange={(value) => setFormData({ ...formData, jobType: value as JobType })}
                            >
                                <SelectTrigger className="bg-background border-border/60">
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
                            <Label>Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-background border-border/60"
                                    placeholder="City, Country"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
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
                                value={formData.resumeId || "none"}
                                onValueChange={(value) => setFormData({ ...formData, resumeId: value === "none" ? "" : value })}
                            >
                                <SelectTrigger className="bg-background border-border/60">
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

                    {/* Tags Selector */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <TagSelector
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border/40">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90">
                            Add Job
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
