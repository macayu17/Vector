export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'OA_RECEIVED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFER'
  | 'REJECTED'
  | 'STALLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';

export interface Application {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  remotePolicy?: string; // 'Remote' | 'Hybrid' | 'On-site'
  status: ApplicationStatus;
  priority: Priority;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  appliedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'OA_RECEIVED',
  'INTERVIEW_SCHEDULED',
  'OFFER',
  'REJECTED',
  'STALLED',
];

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  WISHLIST: { label: 'Wishlist', color: 'bg-slate-500' },
  APPLIED: { label: 'Applied', color: 'bg-blue-500' },
  OA_RECEIVED: { label: 'OA Received', color: 'bg-purple-500' },
  INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-orange-500' },
  OFFER: { label: 'Offer', color: 'bg-green-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
  STALLED: { label: 'Stalled', color: 'bg-yellow-500' },
};
