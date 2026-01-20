export type ApplicationStatus =
  | 'APPLIED'
  | 'OA_RECEIVED'
  | 'INTERVIEW_SCHEDULED'
  | 'REJECTED'
  | 'STALLED'
  | 'WISHLIST';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';

// Resume type for document management
export interface Resume {
  id: string;
  userId: string;
  name: string;
  fileUrl?: string;
  version?: string;
  isDefault: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tag type for labeling applications
export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

// Predefined tag colors
export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
] as const;

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
  resumeId?: string; // Link to resume used
  tags?: Tag[]; // Associated tags
  createdAt: Date;
  updatedAt: Date;
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'OA_RECEIVED',
  'INTERVIEW_SCHEDULED',
  'REJECTED',
  'STALLED',
  'WISHLIST',
];

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  APPLIED: { label: 'Applied', color: 'bg-blue-500' },
  OA_RECEIVED: { label: 'OA Received', color: 'bg-purple-500' },
  INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-orange-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
  STALLED: { label: 'Stalled', color: 'bg-yellow-500' },
  WISHLIST: { label: 'Wishlist', color: 'bg-slate-500' },
};

// Filter state type for search & filters
export interface ApplicationFilters {
  searchQuery: string;
  statuses: ApplicationStatus[];
  priorities: Priority[];
  jobTypes: JobType[];
  tags: string[]; // tag IDs
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export const DEFAULT_FILTERS: ApplicationFilters = {
  searchQuery: '',
  statuses: [],
  priorities: [],
  jobTypes: [],
  tags: [],
  location: '',
  salaryMin: undefined,
  salaryMax: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};
