'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

export function SearchBar() {
    const { filters, setSearchQuery } = useApplicationStore();
    const [localQuery, setLocalQuery] = useState(filters.searchQuery);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [localQuery, setSearchQuery]);

    // Sync with store
    useEffect(() => {
        const frame = requestAnimationFrame(() => setLocalQuery(filters.searchQuery));
        return () => cancelAnimationFrame(frame);
    }, [filters.searchQuery]);

    const handleClear = useCallback(() => {
        setLocalQuery('');
        setSearchQuery('');
    }, [setSearchQuery]);

    return (
        <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search companies, roles, notes..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="border-x-0 border-t-0 bg-transparent pl-7 pr-8"
            />
            {localQuery && (
                <button
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
