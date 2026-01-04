import { create } from 'zustand';
import { Application, ApplicationStatus } from '@/types';
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
    created_at: string;
    updated_at: string;
}

// Convert database row to Application type
function dbToApp(row: DbApplication): Application {
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
    return result;
}

interface ApplicationStore {
    applications: Application[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchApplications: () => Promise<void>;
    moveApplication: (id: string, newStatus: ApplicationStatus) => Promise<void>;
    addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
    deleteApplication: (id: string) => Promise<void>;

    // Selectors
    getApplicationsByStatus: (status: ApplicationStatus) => Application[];
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
    applications: [],
    loading: false,
    error: null,

    fetchApplications: async () => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ applications: (data || []).map(dbToApp), loading: false });
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
                applications: [dbToApp(data), ...state.applications],
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

    getApplicationsByStatus: (status) => {
        return get().applications.filter((app) => app.status === status);
    },
}));

