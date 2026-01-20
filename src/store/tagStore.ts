import { create } from 'zustand';
import { Tag } from '@/types';
import { getSupabase } from '@/lib/supabase';

// Database row type (snake_case)
interface DbTag {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
}

// Convert database row to Tag type
function dbToTag(row: DbTag): Tag {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        color: row.color,
        createdAt: new Date(row.created_at),
    };
}

// Convert Tag to database row
function tagToDb(tag: Partial<Tag> & { userId?: string }): Partial<DbTag> {
    const result: Partial<DbTag> = {};
    if (tag.userId !== undefined) result.user_id = tag.userId;
    if (tag.name !== undefined) result.name = tag.name;
    if (tag.color !== undefined) result.color = tag.color;
    return result;
}

interface TagStore {
    tags: Tag[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchTags: () => Promise<void>;
    addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => Promise<Tag | null>;
    updateTag: (id: string, data: Partial<Tag>) => Promise<void>;
    deleteTag: (id: string) => Promise<void>;

    // Application-Tag operations
    addTagToApplication: (applicationId: string, tagId: string) => Promise<void>;
    removeTagFromApplication: (applicationId: string, tagId: string) => Promise<void>;
    getTagsForApplication: (applicationId: string) => Promise<Tag[]>;
}

export const useTagStore = create<TagStore>((set, get) => ({
    tags: [],
    loading: false,
    error: null,

    fetchTags: async () => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('tags')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            set({ tags: (data || []).map(dbToTag), loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addTag: async (tag) => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const dbData = {
                ...tagToDb(tag),
                user_id: user.id,
            };

            const { data, error } = await supabase
                .from('tags')
                .insert(dbData)
                .select()
                .single();

            if (error) throw error;

            const newTag = dbToTag(data);
            set((state) => ({
                tags: [...state.tags, newTag].sort((a, b) => a.name.localeCompare(b.name)),
                loading: false,
            }));
            return newTag;
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            return null;
        }
    },

    updateTag: async (id, data) => {
        // Optimistic update
        const prev = get().tags;
        set({
            tags: prev.map((t) =>
                t.id === id ? { ...t, ...data } : t
            ).sort((a, b) => a.name.localeCompare(b.name)),
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('tags')
                .update(tagToDb(data))
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            set({ tags: prev, error: (error as Error).message });
        }
    },

    deleteTag: async (id) => {
        // Optimistic update
        const prev = get().tags;
        set({
            tags: prev.filter((t) => t.id !== id),
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('tags')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            set({ tags: prev, error: (error as Error).message });
        }
    },

    addTagToApplication: async (applicationId, tagId) => {
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('application_tags')
                .insert({ application_id: applicationId, tag_id: tagId });

            if (error && !error.message.includes('duplicate')) throw error;
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    removeTagFromApplication: async (applicationId, tagId) => {
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('application_tags')
                .delete()
                .eq('application_id', applicationId)
                .eq('tag_id', tagId);

            if (error) throw error;
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    getTagsForApplication: async (applicationId) => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('application_tags')
                .select('tag_id, tags(*)')
                .eq('application_id', applicationId);

            if (error) throw error;

            if (!data) return [];

            // Handle Supabase's dynamic join types by converting through unknown
            const results: Tag[] = [];
            for (const row of data) {
                const tagData = row.tags as unknown;
                if (tagData && typeof tagData === 'object' && tagData !== null && 'id' in tagData) {
                    results.push(dbToTag(tagData as DbTag));
                }
            }
            return results;
        } catch (error) {
            set({ error: (error as Error).message });
            return [];
        }
    },
}));
