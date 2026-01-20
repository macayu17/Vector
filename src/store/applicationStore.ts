import { create } from 'zustand';
import { Application, ApplicationStatus, ApplicationFilters, DEFAULT_FILTERS, Tag } from '@/types';
import { getSupabase } from '@/lib/supabase';

// Type for database row (snake_case)
interface DbApplication {
    id: string;
    user_id: string;
    company_name: string;
    job_title: string;
    job_url: string | null;
    location: string | null;
    remote_policy: string | null;
    status: ApplicationStatus;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    job_type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
    salary_min: number | null;
    salary_max: number | null;
    currency: string;
    applied_date: string | null;
    notes: string | null;
    resume_id: string | null;
    created_at: string;
    updated_at: string;
}

// Convert database row to Application type
function dbToApp(row: DbApplication, tags?: Tag[]): Application {
    return {
        id: row.id,
        userId: row.user_id,
        companyName: row.company_name,
        jobTitle: row.job_title,
        jobUrl: row.job_url ?? undefined,
        location: row.location ?? undefined,
        remotePolicy: row.remote_policy ?? undefined,
        status: row.status,
        priority: row.priority,
        jobType: row.job_type,
        salaryMin: row.salary_min ?? undefined,
        salaryMax: row.salary_max ?? undefined,
        currency: row.currency,
        appliedDate: row.applied_date ? new Date(row.applied_date) : undefined,
        notes: row.notes ?? undefined,
        resumeId: row.resume_id ?? undefined,
        tags: tags || [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}

// Convert Application to database row
function appToDb(app: Partial<Application> & { userId?: string }): Partial<DbApplication> {
    const result: Partial<DbApplication> = {};
    if (app.userId !== undefined) result.user_id = app.userId;
    if (app.companyName !== undefined) result.company_name = app.companyName;
    if (app.jobTitle !== undefined) result.job_title = app.jobTitle;
    if (app.jobUrl !== undefined) result.job_url = app.jobUrl ?? null;
    if (app.location !== undefined) result.location = app.location ?? null;
    if (app.remotePolicy !== undefined) result.remote_policy = app.remotePolicy ?? null;
    if (app.status !== undefined) result.status = app.status;
    if (app.priority !== undefined) result.priority = app.priority;
    if (app.jobType !== undefined) result.job_type = app.jobType;
    if (app.salaryMin !== undefined) result.salary_min = app.salaryMin ?? null;
    if (app.salaryMax !== undefined) result.salary_max = app.salaryMax ?? null;
    if (app.currency !== undefined) result.currency = app.currency;
    if (app.appliedDate !== undefined) result.applied_date = app.appliedDate?.toISOString() ?? null;
    if (app.notes !== undefined) result.notes = app.notes ?? null;
    if (app.resumeId !== undefined) result.resume_id = app.resumeId ?? null;
    return result;
}

interface ApplicationStore {
    applications: Application[];
    loading: boolean;
    error: string | null;

    // Selection state for bulk actions
    selectedIds: string[];

    // Filter state
    filters: ApplicationFilters;

    // Actions
    fetchApplications: () => Promise<void>;
    moveApplication: (id: string, newStatus: ApplicationStatus) => Promise<void>;
    addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
    deleteApplication: (id: string) => Promise<void>;

    // Bulk Actions
    bulkUpdateStatus: (ids: string[], status: ApplicationStatus) => Promise<void>;
    bulkDelete: (ids: string[]) => Promise<void>;

    // Selection Actions
    toggleSelection: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;

    // Filter Actions
    setFilters: (filters: Partial<ApplicationFilters>) => void;
    clearFilters: () => void;
    setSearchQuery: (query: string) => void;

    // Selectors
    getApplicationsByStatus: (status: ApplicationStatus) => Application[];
    getFilteredApplications: () => Application[];
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
    applications: [],
    loading: false,
    error: null,
    selectedIds: [],
    filters: DEFAULT_FILTERS,

    fetchApplications: async () => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();

            // Fetch applications with their tags
            const { data: apps, error: appsError } = await supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (appsError) throw appsError;

            // Fetch all application_tags with tag details
            const { data: appTags, error: tagsError } = await supabase
                .from('application_tags')
                .select('application_id, tags(*)');

            if (tagsError) throw tagsError;

            // Group tags by application_id
            const tagsByApp: Record<string, Tag[]> = {};
            // @ts-expect-error - Supabase join types are dynamically inferred
            (appTags || []).forEach((at: { application_id: string; tags: { id: string; user_id: string; name: string; color: string; created_at: string } | null }) => {
                if (!tagsByApp[at.application_id]) {
                    tagsByApp[at.application_id] = [];
                }
                if (at.tags) {
                    tagsByApp[at.application_id].push({
                        id: at.tags.id,
                        userId: at.tags.user_id,
                        name: at.tags.name,
                        color: at.tags.color,
                        createdAt: new Date(at.tags.created_at),
                    });
                }
            });

            const applications = (apps || []).map((app: DbApplication) =>
                dbToApp(app, tagsByApp[app.id] || [])
            );

            set({ applications, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    moveApplication: async (id, newStatus) => {
        // Optimistic update
        const prev = get().applications;
        set({
            applications: prev.map((app) =>
                app.id === id ? { ...app, status: newStatus, updatedAt: new Date() } : app
            ),
        });

        try {
            const supabase = getSupabase();
            const updates: Partial<DbApplication> = {
                status: newStatus,
                updated_at: new Date().toISOString(),
            };

            // Auto-set applied_date when moving to APPLIED
            const app = prev.find((a) => a.id === id);
            if (app?.status === 'WISHLIST' && newStatus === 'APPLIED' && !app.appliedDate) {
                updates.applied_date = new Date().toISOString();
            }

            const { error } = await supabase
                .from('applications')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            // Rollback on error
            set({ applications: prev, error: (error as Error).message });
        }
    },

    addApplication: async (application) => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const dbData = {
                ...appToDb(application),
                user_id: user.id,
            };

            const { data, error } = await supabase
                .from('applications')
                .insert(dbData)
                .select()
                .single();

            if (error) throw error;
            set((state) => ({
                applications: [dbToApp(data, application.tags || []), ...state.applications],
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    updateApplication: async (id, data) => {
        // Optimistic update
        const prev = get().applications;
        set({
            applications: prev.map((app) =>
                app.id === id ? { ...app, ...data, updatedAt: new Date() } : app
            ),
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('applications')
                .update({ ...appToDb(data), updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            // Rollback on error
            set({ applications: prev, error: (error as Error).message });
        }
    },

    deleteApplication: async (id) => {
        // Optimistic update
        const prev = get().applications;
        set({
            applications: prev.filter((app) => app.id !== id),
            selectedIds: get().selectedIds.filter((sid) => sid !== id),
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            // Rollback on error
            set({ applications: prev, error: (error as Error).message });
        }
    },

    // Bulk Actions
    bulkUpdateStatus: async (ids, status) => {
        const prev = get().applications;

        // Optimistic update
        set({
            applications: prev.map((app) =>
                ids.includes(app.id) ? { ...app, status, updatedAt: new Date() } : app
            ),
            selectedIds: [],
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('applications')
                .update({ status, updated_at: new Date().toISOString() })
                .in('id', ids);

            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message });
        }
    },

    bulkDelete: async (ids) => {
        const prev = get().applications;

        // Optimistic update
        set({
            applications: prev.filter((app) => !ids.includes(app.id)),
            selectedIds: [],
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('applications')
                .delete()
                .in('id', ids);

            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message });
        }
    },

    // Selection Actions
    toggleSelection: (id) => {
        set((state) => ({
            selectedIds: state.selectedIds.includes(id)
                ? state.selectedIds.filter((sid) => sid !== id)
                : [...state.selectedIds, id],
        }));
    },

    selectAll: (ids) => {
        set({ selectedIds: ids });
    },

    clearSelection: () => {
        set({ selectedIds: [] });
    },

    isSelected: (id) => {
        return get().selectedIds.includes(id);
    },

    // Filter Actions
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }));
    },

    clearFilters: () => {
        set({ filters: DEFAULT_FILTERS });
    },

    setSearchQuery: (query) => {
        set((state) => ({
            filters: { ...state.filters, searchQuery: query },
        }));
    },

    // Selectors
    getApplicationsByStatus: (status) => {
        return get().applications.filter((app) => app.status === status);
    },

    getFilteredApplications: () => {
        const { applications, filters } = get();

        return applications.filter((app) => {
            // Search query - matches company name, job title, or notes
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const matchesSearch =
                    app.companyName.toLowerCase().includes(query) ||
                    app.jobTitle.toLowerCase().includes(query) ||
                    (app.notes?.toLowerCase().includes(query) ?? false) ||
                    (app.location?.toLowerCase().includes(query) ?? false);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.statuses.length > 0 && !filters.statuses.includes(app.status)) {
                return false;
            }

            // Priority filter
            if (filters.priorities.length > 0 && !filters.priorities.includes(app.priority)) {
                return false;
            }

            // Job type filter
            if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(app.jobType)) {
                return false;
            }

            // Location filter
            if (filters.location && !app.location?.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }

            // Salary filter
            if (filters.salaryMin !== undefined && (app.salaryMax ?? 0) < filters.salaryMin) {
                return false;
            }
            if (filters.salaryMax !== undefined && (app.salaryMin ?? Infinity) > filters.salaryMax) {
                return false;
            }

            // Tags filter
            if (filters.tags.length > 0) {
                const appTagIds = app.tags?.map(t => t.id) || [];
                const hasAllTags = filters.tags.every(tagId => appTagIds.includes(tagId));
                if (!hasAllTags) return false;
            }

            // Date range filter
            if (filters.dateFrom && app.appliedDate && new Date(app.appliedDate) < filters.dateFrom) {
                return false;
            }
            if (filters.dateTo && app.appliedDate && new Date(app.appliedDate) > filters.dateTo) {
                return false;
            }

            return true;
        });
    },
}));
