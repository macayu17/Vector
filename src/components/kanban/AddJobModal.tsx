'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApplicationStore } from '@/store/applicationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Application, ApplicationStatus, JobType } from '@/types';
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
import { Building2, MapPin, Search } from 'lucide-react';
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

interface AddJobModalProps {
    open: boolean;
    onClose: () => void;
    defaultStatus?: ApplicationStatus;
}

export function AddJobModal({ open, onClose, defaultStatus = 'WISHLIST' }: AddJobModalProps) {
    const { addApplication } = useApplicationStore();
    const { settings } = useSettingsStore();

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
    });

    const [companyOpen, setCompanyOpen] = useState(false);

    // Combine top companies with a manual "Others" option logic
    const companyOptions = [...TOP_100_COMPANIES];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.companyName || !formData.jobTitle) return;

        const newApplication: Application = {
            id: uuidv4(),
            userId: 'user-001',
            companyName: formData.companyName,
            jobTitle: formData.jobTitle,
            jobUrl: formData.jobUrl,
            location: formData.location,
            remotePolicy: formData.remotePolicy,
            status: defaultStatus,
            priority: formData.priority as any,
            jobType: formData.jobType,
            salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
            salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
            currency: 'INR',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        addApplication(newApplication);
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
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md glass-card p-6 border-t-4 border-t-primary">
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
                                            <button
                                                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                                                onClick={() => {
                                                    // Allow typing any custom value
                                                    // This requires accessing the input value from command state if possible,
                                                    // or asking user to type it in a separate input if not found.
                                                    // For simplicity in this UI pattern:
                                                    // We can just set the search value as the company name if we could access it.
                                                    // But Command component abstracts that.
                                                    // ALTERNATIVE: Use a simple input + datalist or just an Input field 
                                                    // if user wants to type manually.
                                                    // Let's modify the UI slightly to allow manual override.
                                                }}
                                            >
                                                Type manually in the box below to add specific company
                                            </button>
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

                        {/* Fallback/Override Input for Manual Entry */}
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
