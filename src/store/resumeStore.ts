import { create } from 'zustand';
import { Resume } from '@/types';
import { getSupabase } from '@/lib/supabase';

// Database row type (snake_case)
interface DbResume {
    id: string;
    user_id: string;
    name: string;
    file_url: string | null;
    version: string | null;
    is_default: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// Convert database row to Resume type
function dbToResume(row: DbResume): Resume {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        fileUrl: row.file_url ?? undefined,
        version: row.version ?? undefined,
        isDefault: row.is_default,
        notes: row.notes ?? undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}

// Convert Resume to database row
function resumeToDb(resume: Partial<Resume> & { userId?: string }): Partial<DbResume> {
    const result: Partial<DbResume> = {};
    if (resume.userId !== undefined) result.user_id = resume.userId;
    if (resume.name !== undefined) result.name = resume.name;
    if (resume.fileUrl !== undefined) result.file_url = resume.fileUrl ?? null;
    if (resume.version !== undefined) result.version = resume.version ?? null;
    if (resume.isDefault !== undefined) result.is_default = resume.isDefault;
    if (resume.notes !== undefined) result.notes = resume.notes ?? null;
    return result;
}

interface ResumeStore {
    resumes: Resume[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchResumes: () => Promise<void>;
    addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateResume: (id: string, data: Partial<Resume>) => Promise<void>;
    deleteResume: (id: string) => Promise<void>;
    setDefaultResume: (id: string) => Promise<void>;

    // Selectors
    getDefaultResume: () => Resume | undefined;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
    resumes: [],
    loading: false,
    error: null,

    fetchResumes: async () => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('resumes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ resumes: (data || []).map(dbToResume), loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addResume: async (resume) => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const dbData = {
                ...resumeToDb(resume),
                user_id: user.id,
            };

            const { data, error } = await supabase
                .from('resumes')
                .insert(dbData)
                .select()
                .single();

            if (error) throw error;
            set((state) => ({
                resumes: [dbToResume(data), ...state.resumes],
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    updateResume: async (id, data) => {
        // Optimistic update
        const prev = get().resumes;
        set({
            resumes: prev.map((r) =>
                r.id === id ? { ...r, ...data, updatedAt: new Date() } : r
            ),
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('resumes')
                .update({ ...resumeToDb(data), updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            set({ resumes: prev, error: (error as Error).message });
        }
    },

    deleteResume: async (id) => {
        // Optimistic update
        const prev = get().resumes;
        set({
            resumes: prev.filter((r) => r.id !== id),
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('resumes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            set({ resumes: prev, error: (error as Error).message });
        }
    },

    setDefaultResume: async (id) => {
        const prev = get().resumes;

        // Optimistic update - set all to false, then target to true
        set({
            resumes: prev.map((r) => ({
                ...r,
                isDefault: r.id === id,
                updatedAt: new Date(),
            })),
        });

        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // First, set all resumes to non-default
            await supabase
                .from('resumes')
                .update({ is_default: false })
                .eq('user_id', user.id);

            // Then set the selected one as default
            const { error } = await supabase
                .from('resumes')
                .update({ is_default: true, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            set({ resumes: prev, error: (error as Error).message });
        }
    },

    getDefaultResume: () => {
        return get().resumes.find((r) => r.isDefault);
    },
}));
