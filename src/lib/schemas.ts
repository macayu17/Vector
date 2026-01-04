import { z } from 'zod';
import { APPLICATION_STATUSES, PRIORITY_LEVELS } from '@/types';

// Application validation schema
export const applicationSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    jobUrl: z.string().url('Invalid URL').optional().nullable(),
    location: z.string().optional().nullable(),
    remotePolicy: z.string().optional().nullable(),
    status: z.enum(APPLICATION_STATUSES).default('WISHLIST'),
    priority: z.enum(PRIORITY_LEVELS).default('MEDIUM'),
    appliedDate: z.coerce.date().optional().nullable(),
    salaryMin: z.number().int().positive().optional().nullable(),
    salaryMax: z.number().int().positive().optional().nullable(),
    currency: z.string().default('USD'),
    resumeVersionLink: z.string().url('Invalid URL').optional().nullable(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// Schema for updating application status (drag and drop)
export const updateStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(APPLICATION_STATUSES),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// Note validation schema
export const noteSchema = z.object({
    applicationId: z.string().uuid(),
    content: z.string().min(1, 'Note content is required'),
    isPinned: z.boolean().default(false),
});

export type NoteInput = z.infer<typeof noteSchema>;

// Contact validation schema
export const contactSchema = z.object({
    applicationId: z.string().uuid(),
    name: z.string().min(1, 'Contact name is required'),
    role: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable(),
    linkedinUrl: z.string().url('Invalid URL').optional().nullable(),
});

export type ContactInput = z.infer<typeof contactSchema>;
